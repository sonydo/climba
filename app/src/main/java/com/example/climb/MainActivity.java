package com.example.climb;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class MainActivity extends AppCompatActivity {

    private static final String APP_URL = "https://ais-dev-hptlblbbic7btz4k2zdqnp-432058254310.us-west1.run.app";
    private static final int LOCATION_PERMISSION_REQUEST = 1001;

    private WebView webView;
    private LinearLayout layoutSplash;
    private LinearLayout layoutError;
    private ImageButton btnRefresh;
    private Button btnRetry;
    private GeolocationPermissions.Callback geolocationCallback;
    private String geolocationOrigin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Barra de estado oscura a juego con la app
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(0xFF0E121E);
            window.setNavigationBarColor(0xFF07080D);
        }

        webView = findViewById(R.id.webView);
        layoutSplash = findViewById(R.id.layoutSplash);
        layoutError = findViewById(R.id.layoutError);
        btnRefresh = findViewById(R.id.btnRefresh);
        btnRetry = findViewById(R.id.btnRetry);

        setupWebView();

        if (btnRefresh != null) {
            btnRefresh.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (webView != null) {
                        webView.reload();
                    }
                }
            });
        }

        if (btnRetry != null) {
            btnRetry.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (layoutError != null) layoutError.setVisibility(View.GONE);
                    if (layoutSplash != null) layoutSplash.setVisibility(View.VISIBLE);
                    if (webView != null) webView.loadUrl(APP_URL);
                }
            });
        }

        // Permisos de GPS para el pronóstico local
        requestLocationPermissions();

        // Cargar la aplicación interactiva de ClimaVerse
        webView.loadUrl(APP_URL);
    }

    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMediaPlaybackRequiresUserGesture(false);

        // Aceleración por hardware
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Ocultar suavemente la pantalla de carga (splash)
                if (layoutSplash != null && layoutSplash.getVisibility() == View.VISIBLE) {
                    layoutSplash.animate()
                            .alpha(0.0f)
                            .setDuration(400)
                            .withEndAction(new Runnable() {
                                @Override
                                public void run() {
                                    layoutSplash.setVisibility(View.GONE);
                                }
                            });
                }
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    if (layoutSplash != null) layoutSplash.setVisibility(View.GONE);
                    if (layoutError != null) layoutError.setVisibility(View.VISIBLE);
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                geolocationOrigin = origin;
                geolocationCallback = callback;
                if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                    callback.invoke(origin, true, false);
                } else {
                    ActivityCompat.requestPermissions(MainActivity.this,
                            new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION},
                            LOCATION_PERMISSION_REQUEST);
                }
            }
        });
    }

    private void requestLocationPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION},
                    LOCATION_PERMISSION_REQUEST);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == LOCATION_PERMISSION_REQUEST) {
            boolean granted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
            if (geolocationCallback != null && geolocationOrigin != null) {
                geolocationCallback.invoke(geolocationOrigin, granted, false);
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
