#
# Kontrol PostgreSQL lokal untuk Smart Gate.
#
# PENTING: postmaster dijalankan TANPA konsol interaktif (Start-Process),
# dari direktori bin PostgreSQL, dan log ditulis DI LUAR folder data.
# Alasan: pada sesi interaktif, proses anak postgres.exe gagal start
# (exception 0xC0000142 / "could not reserve shared memory region ... 487").
# Instance yang dijalankan lewat Windows Service (session 0) tidak pernah
# mengalami ini. Lihat docs/POSTGRES-WINDOWS.md.
#
# Contoh:
#   .\scripts\pg.ps1 start
#   .\scripts\pg.ps1 stop
#   .\scripts\pg.ps1 status
#
param(
    [ValidateSet('start', 'stop', 'status', 'restart')]
    [string]$Action = 'status'
)

$ErrorActionPreference = 'Stop'

$PgBin     = 'C:\Program Files\PostgreSQL\18\bin'
$PgData    = Join-Path $PSScriptRoot '..\pgdata'
$LogDir    = Join-Path $PSScriptRoot '..\pglogs'
$LogFile   = Join-Path $LogDir 'postgres.log'
$Port      = 5433

function Invoke-Pg {
    param([string[]]$PgArgs)
    & (Join-Path $PgBin 'pg_ctl.exe') @PgArgs
}

switch ($Action) {
    'start' {
        New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
        # Log di luar folder data: PostgreSQL me-fsync seluruh isi data dir saat start,
        # dan file log di dalam data dir memicu "sharing violation" (antivirus/antivirus scan).
        # port + listen_addresses + shared_buffers diatur di pgdata/postgresql.conf
        # Path berisi spasi -> harus diapit tanda kutip saat diteruskan ke Start-Process
        # -W: pg_ctl tidak menunggu server siap (kita yang cek sendiri di bawah)
        $args = @('start', '-D', "`"$PgData`"", '-l', "`"$LogFile`"", '-W')
        Start-Process -FilePath (Join-Path $PgBin 'pg_ctl.exe') -ArgumentList $args `
            -WorkingDirectory $PgBin -WindowStyle Hidden -Wait
        for ($i = 0; $i -lt 30; $i++) {
            Start-Sleep -Seconds 1
            $state = & (Join-Path $PgBin 'pg_isready.exe') -h 127.0.0.1 -p $Port
            if ($state -match 'accepting connections') { $state; break }
        }
        & (Join-Path $PgBin 'pg_isready.exe') -h 127.0.0.1 -p $Port
    }
    'stop' {
        Invoke-Pg @('stop', '-D', $PgData, '-m', 'fast')
    }
    'restart' {
        & $PSCommandPath -Action stop
        & $PSCommandPath -Action start
    }
    'status' {
        & (Join-Path $PgBin 'pg_isready.exe') -h 127.0.0.1 -p $Port
    }
}
