package com.example.climb;

import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        TextView tv = new TextView(this);
        tv.setText("¡Tu aplicación del clima!");
        
        // 1. Forzamos el color del texto a negro
        tv.setTextColor(Color.BLACK);
        
        // 2. Forzamos el color de fondo de la pantalla a blanco
        tv.setBackgroundColor(Color.WHITE);
        
        // 3. Agrandamos la letra para que se note bien
        tv.setTextSize(22);
        
        // 4. Centramos el texto en el medio de la pantalla
        tv.setGravity(Gravity.CENTER);
        
        setContentView(tv);
    }
}
