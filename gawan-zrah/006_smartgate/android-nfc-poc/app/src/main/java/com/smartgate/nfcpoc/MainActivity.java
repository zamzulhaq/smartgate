package com.smartgate.nfcpoc;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.IntentFilter;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.TagTechnology;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;

import java.util.Arrays;

public class MainActivity extends Activity {
    private NfcAdapter nfcAdapter;
    private PendingIntent pendingIntent;
    private IntentFilter[] intentFiltersArray;
    private String[][] techListsArray;
    private TextView resultText;
    private TextView statusText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        resultText = findViewById(R.id.resultText);
        statusText = findViewById(R.id.statusText);

        nfcAdapter = NfcAdapter.getDefaultAdapter(this);
        if (nfcAdapter == null) {
            statusText.setText("Perangkat tidak memiliki NFC");
            Toast.makeText(this, "NFC tidak tersedia", Toast.LENGTH_LONG).show();
            return;
        }
        if (!nfcAdapter.isEnabled()) {
            statusText.setText("NFC nonaktif. Aktifkan NFC di pengaturan.");
        }

        pendingIntent = PendingIntent.getActivity(
                this, 0,
                new Intent(this, getClass()).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
                PendingIntent.FLAG_MUTABLE
        );

        IntentFilter tagDetected = new IntentFilter(NfcAdapter.ACTION_TAG_DISCOVERED);
        tagDetected.addCategory(Intent.CATEGORY_DEFAULT);
        IntentFilter techDetected = new IntentFilter(NfcAdapter.ACTION_TECH_DISCOVERED);
        techDetected.addCategory(Intent.CATEGORY_DEFAULT);
        intentFiltersArray = new IntentFilter[]{tagDetected, techDetected};

        techListsArray = new String[][]{
                new String[]{"android.nfc.tech.NfcA"},
                new String[]{"android.nfc.tech.NfcB"},
                new String[]{"android.nfc.tech.NfcF"},
                new String[]{"android.nfc.tech.NfcV"},
                new String[]{"android.nfc.tech.IsoDep"},
                new String[]{"android.nfc.tech.MifareClassic"},
                new String[]{"android.nfc.tech.MifareUltralight"},
                new String[]{"android.nfc.tech.Ndef"},
                new String[]{"android.nfc.tech.NdefFormatable"}
        };

        handleIntent(getIntent());
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (nfcAdapter != null) {
            nfcAdapter.enableForegroundDispatch(this, pendingIntent, intentFiltersArray, techListsArray);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (nfcAdapter != null) {
            nfcAdapter.disableForegroundDispatch(this);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        if (NfcAdapter.ACTION_TAG_DISCOVERED.equals(action) || 
            NfcAdapter.ACTION_TECH_DISCOVERED.equals(action)) {
            Tag tag = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
            if (tag != null) {
                displayTagInfo(tag);
            }
        }
    }

    private void displayTagInfo(Tag tag) {
        StringBuilder sb = new StringBuilder();
        sb.append("Waktu baca: ").append(java.text.DateFormat.getDateTimeInstance().format(new java.util.Date())).append("\n\n");
        sb.append("ID (hex): ").append(bytesToHex(tag.getId())).append("\n");
        sb.append("ID (reversed hex): ").append(bytesToHex(reverseBytes(tag.getId()))).append("\n\n");
        sb.append("Teknologi terdeteksi:\n");
        String[] techList = tag.getTechList();
        for (String tech : techList) {
            sb.append("  - ").append(tech).append("\n");
        }
        sb.append("\nCatatan:\n");
        sb.append("- Hanya menampilkan info pembacaan lokal.\n");
        sb.append("- Tidak ada penyimpanan permanen atau pengiriman ke server.\n");
        sb.append("- Tidak membaca biodata e-KTP.\n");
        
        resultText.setText(sb.toString());
        statusText.setText("Tag terdeteksi");
    }

    private String bytesToHex(byte[] bytes) {
        if (bytes == null) return "-";
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02X", b & 0xFF));
        }
        return sb.toString();
    }

    private byte[] reverseBytes(byte[] bytes) {
        if (bytes == null) return null;
        byte[] reversed = new byte[bytes.length];
        for (int i = 0; i < bytes.length; i++) {
            reversed[i] = bytes[bytes.length - 1 - i];
        }
        return reversed;
    }
}
