import React, { useState } from 'react';
import { Code2, X, Copy, Check, Smartphone, Download, FileCode, Layers, GitBranch, Terminal } from 'lucide-react';
import { generateKotlinAppCode } from '../utils/kotlinCodeGenerator';

interface KotlinCodeViewerModalProps {
  cityName: string;
  currentTemp: number;
  isOpen: boolean;
  onClose: () => void;
}

export const KotlinCodeViewerModal: React.FC<KotlinCodeViewerModalProps> = ({
  cityName,
  currentTemp,
  isOpen,
  onClose
}) => {
  const kotlinFiles = generateKotlinAppCode(cityName, currentTemp);

  // Also include the user's Android CI/CD APK files
  const androidCiFiles = [
    {
      filename: '.github/workflows/android.yml',
      description: 'GitHub Actions Workflow para compilar y generar APK automáticamente en la nube',
      code: `name: Generar APK de Android

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Descargar el código del repositorio
      uses: actions/checkout@v4

    - name: Configurar Java JDK 17
      uses: actions/setup-java@v5
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Configurar Gradle en el servidor
      uses: gradle/actions/setup-gradle@v4
      with:
        gradle-version: '8.5'

    - name: Generar el archivo ejecutable gradlew
      run: gradle wrapper --gradle-version 8.5

    - name: Dar permisos de ejecución
      run: chmod +x gradlew

    - name: Compilar el archivo APK (Debug)
      run: ./gradlew assembleDebug

    - name: Subir el archivo APK generado a GitHub
      uses: actions/upload-artifact@v4
      with:
        name: Mi-Aplicacion-AI-Studio-APK
        path: app/build/outputs/apk/debug/app-debug.apk`
    },
    {
      filename: 'app/build.gradle',
      description: 'Configuración de compilación Android Gradle (SDK 34, Java 17, AppCompat)',
      code: `plugins {
    id 'com.android.application'
}

android {
    namespace 'com.example.climb'
    compileSdk 34

    defaultConfig {
        applicationId "com.example.climb"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            minifyEnabled false
        }
        debug {
            minifyEnabled false
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    applicationVariants.all { variant ->
        variant.outputs.all { output ->
            processManifestProvider.configure {
                it.labelCheckUpToDate = false
                it.manifestMergeReport = false
            }
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
}`
    },
    {
      filename: 'app/src/main/res/drawable/ic_sun_launcher.xml',
      description: 'Icono vectorial de Sol Naranja radiante para la aplicación de Android',
      code: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- Fondo Circular Oscuro -->
    <path
        android:fillColor="#0D111D"
        android:pathData="M54,4 C81.61,4 104,26.39 104,54 C104,81.61 81.61,104 54,104 C26.39,104 4,81.61 4,54 C4,26.39 26.39,4 54,4 Z" />
    <!-- Resplandor Naranja Exterior -->
    <path
        android:fillColor="#33FF8A00"
        android:pathData="M54,18 C73.88,18 90,34.12 90,54 C90,73.88 73.88,90 54,90 C34.12,90 18,73.88 18,54 C18,34.12 34.12,18 54,18 Z" />
    <!-- Núcleo de Sol Naranja -->
    <path
        android:fillColor="#FF7A00"
        android:pathData="M54,26 C69.46,26 82,38.54 82,54 C82,69.46 69.46,82 54,82 C38.54,82 26,69.46 26,54 C26,38.54 38.54,26 54,26 Z" />
    <path
        android:fillColor="#FFB300"
        android:pathData="M54,34 C65.05,34 74,42.95 74,54 C74,65.05 65.05,74 54,74 C42.95,74 34,65.05 34,54 C34,42.95 42.95,34 54,34 Z" />
    <!-- Rayos del Sol -->
    <path android:fillColor="#FFA000" android:pathData="M51,10 L57,10 L55,22 L53,22 Z" />
    <path android:fillColor="#FFA000" android:pathData="M51,86 L57,86 L55,98 L53,98 Z" />
    <path android:fillColor="#FFA000" android:pathData="M10,51 L10,57 L22,55 L22,53 Z" />
    <path android:fillColor="#FFA000" android:pathData="M86,51 L86,57 L98,55 L98,53 Z" />
</vector>`
    },
    {
      filename: 'app/src/main/res/layout/activity_main.xml',
      description: 'Diseño gráfico completo para Android: Cabecera con Sol, WebView acelerada y Splash',
      code: `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#07080D">

    <!-- Barra Superior con Icono de Sol -->
    <LinearLayout
        android:id="@+id/topBar"
        android:layout_width="match_parent"
        android:layout_height="56dp"
        android:background="#0E121E"
        android:gravity="center_vertical"
        android:orientation="horizontal"
        android:paddingStart="16dp"
        android:paddingEnd="16dp">

        <ImageView
            android:layout_width="32dp"
            android:layout_height="32dp"
            android:src="@drawable/ic_sun_launcher" />

        <TextView
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_marginStart="12dp"
            android:layout_weight="1"
            android:text="ClimaVerse Pro"
            android:textColor="#FFFFFF"
            android:textSize="16sp" />

        <ImageButton
            android:id="@+id/btnRefresh"
            android:layout_width="40dp"
            android:layout_height="40dp"
            android:background="?attr/selectableItemBackgroundBorderless"
            android:src="@drawable/ic_sun_launcher" />
    </LinearLayout>

    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:layout_below="@id/topBar" />

    <!-- Pantalla de Carga / Splash con Sol Naranja -->
    <LinearLayout
        android:id="@+id/layoutSplash"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:gravity="center"
        android:orientation="vertical">

        <ImageView
            android:layout_width="96dp"
            android:layout_height="96dp"
            android:src="@drawable/ic_sun_launcher" />

        <ProgressBar
            android:layout_width="36dp"
            android:layout_height="36dp"
            android:layout_marginTop="24dp"
            android:indeterminateTint="#FF7A00" />
    </LinearLayout>
</RelativeLayout>`
    },
    {
      filename: 'app/src/main/AndroidManifest.xml',
      description: 'Manifiesto de Android con icono de sol naranja y permisos de Internet/GPS',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

    <application
        android:allowBackup="true"
        android:icon="@drawable/ic_sun_launcher"
        android:roundIcon="@drawable/ic_sun_launcher"
        android:label="ClimaVerse"
        android:theme="@style/Theme.ClimbApp"
        android:usesCleartextTraffic="true"
        android:hardwareAccelerated="true">

        <activity android:name="com.example.climb.MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>
</manifest>`
    },
    {
      filename: 'MainActivity.java',
      description: 'Actividad Android completa con WebView moderna, geolocalización y splash animado',
      code: `package com.example.climb;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private static final String APP_URL = "https://ais-dev-hptlblbbic7btz4k2zdqnp-432058254310.us-west1.run.app";
    private WebView webView;
    private LinearLayout layoutSplash;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        layoutSplash = findViewById(R.id.layoutSplash);
        ImageButton btnRefresh = findViewById(R.id.btnRefresh);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setGeolocationEnabled(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                if (layoutSplash != null) {
                    layoutSplash.animate().alpha(0f).setDuration(400)
                        .withEndAction(() -> layoutSplash.setVisibility(View.GONE));
                }
            }
        });

        btnRefresh.setOnClickListener(v -> webView.reload());
        webView.loadUrl(APP_URL);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}`
    }
  ];

  const allFiles = [...kotlinFiles, ...androidCiFiles];
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentFile = allFiles[selectedFileIndex] || allFiles[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    allFiles.forEach((f) => {
      const blob = new Blob([f.code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = f.filename.split('/').pop() || f.filename;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#0b0c12] border border-white/10 rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Android Studio & Generador de APK</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30 font-mono">
                  Kotlin & CI/CD
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Código fuente Android (Jetpack Compose + Java + GitHub Actions para compilar APK sin Android Studio)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Descargar todos los archivos"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Descargar Archivos</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* File Switcher Tabs */}
        <div className="flex items-center gap-1 p-2 bg-[#08090d] border-b border-white/10 overflow-x-auto scrollbar-thin">
          {allFiles.map((file, idx) => (
            <button
              key={file.filename}
              onClick={() => setSelectedFileIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                selectedFileIndex === idx
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{file.filename}</span>
            </button>
          ))}
        </div>

        {/* Code Description Bar */}
        <div className="px-5 py-2.5 bg-emerald-950/20 border-b border-white/5 flex items-center justify-between text-xs text-slate-300">
          <span className="font-mono text-emerald-300/90">{currentFile.description}</span>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1.5 font-sans transition-colors border border-white/10"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
          </button>
        </div>

        {/* Code Content Editor */}
        <div className="flex-1 p-4 bg-[#050507] overflow-y-auto font-mono text-xs leading-relaxed text-slate-200 select-all scrollbar-thin">
          <pre className="whitespace-pre-wrap">
            {currentFile.code.split('\n').map((line, i) => (
              <div key={i} className="table-row">
                <span className="table-cell select-none pr-4 text-right text-slate-600 text-[11px] w-8">
                  {i + 1}
                </span>
                <span className="table-cell">{line}</span>
              </div>
            ))}
          </pre>
        </div>

        {/* Footer Instructions for Android Developers */}
        <div className="p-3 bg-white/5 border-t border-white/10 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Tip: Para compilar tu APK gratis en GitHub, haz push a tu repo y GitHub Actions generará el archivo automáticamente en la pestaña <strong>Actions</strong>.</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">Android SDK 34 • Gradle 8.5</span>
        </div>
      </div>
    </div>
  );
};
