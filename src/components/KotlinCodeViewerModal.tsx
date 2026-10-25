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
      filename: 'app/src/main/AndroidManifest.xml',
      description: 'Manifiesto de la aplicación Android con MainActivity declarada',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.climb">

    <application
        android:allowBackup="true"
        android:label="Climb App"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.NoActionBar">

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
      description: 'Actividad Android Java básica con vista textual para APK',
      code: `package com.example.climb;

import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        TextView tv = new TextView(this);
        tv.setText("¡Climb App con Google AI Studio Lista!");
        setContentView(tv);
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
