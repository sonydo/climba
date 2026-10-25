export interface KotlinFile {
  filename: string;
  description: string;
  code: string;
}

export function generateKotlinAppCode(cityName: string, currentTemp: number): KotlinFile[] {
  return [
    {
      filename: 'MainActivity.kt',
      description: 'Activity principal de Android con Jetpack Compose y Material3',
      code: `package com.example.climb

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.climb.ui.WeatherScreen
import com.example.climb.viewmodel.WeatherViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: WeatherViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = Color(0xFF0B0C12),
                    surface = Color(0xFF141721),
                    primary = Color(0xFF3B82F6)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val weatherState by viewModel.weatherState.collectAsState()
                    WeatherScreen(
                        state = weatherState,
                        onRefresh = { viewModel.refreshWeather() }
                    )
                }
            }
        }
    }
}`
    },
    {
      filename: 'WeatherScreen.kt',
      description: 'Interfaz de usuario moderna con Compose (Tarjetas térmicas, vientos y pronóstico)',
      code: `package com.example.climb.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.climb.data.WeatherModel

@Composable
fun WeatherScreen(
    state: WeatherModel,
    onRefresh: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Encabezado de Ciudad
        Text(
            text = state.cityName,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )
        Text(
            text = "Tiempo en Vivo",
            fontSize = 14.sp,
            color = Color.Gray
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Hero Card Temperatura
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E2235)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "\${state.temperature}°C",
                    fontSize = 56.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White
                )
                Text(
                    text = state.conditionDescription,
                    fontSize = 18.sp,
                    color = Color(0xFF60A5FA)
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Botón de Actualizar
        Button(
            onClick = onRefresh,
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
        ) {
            Text("Actualizar Meteorología")
        }
    }
}`
    },
    {
      filename: 'WeatherViewModel.kt',
      description: 'ViewModel MVVM con StateFlow reactivo y Coroutines de Kotlin',
      code: `package com.example.climb.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.climb.data.WeatherModel
import com.example.climb.data.WeatherRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class WeatherViewModel : ViewModel() {
    private val repository = WeatherRepository()

    private val _weatherState = MutableStateFlow(
        WeatherModel(
            cityName = "${cityName}",
            temperature = ${currentTemp},
            conditionDescription = "Cielo despejado",
            humidity = 58,
            windSpeed = 14.0
        )
    )
    val weatherState: StateFlow<WeatherModel> = _weatherState.asStateFlow()

    fun refreshWeather() {
        viewModelScope.launch {
            try {
                val updated = repository.fetchWeatherForCity("${cityName}")
                _weatherState.value = updated
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}`
    },
    {
      filename: 'WeatherRepository.kt',
      description: 'Capa de datos y llamadas HTTP con Retrofit 2 a la API Open-Meteo',
      code: `package com.example.climb.data

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query

data class WeatherModel(
    val cityName: String,
    val temperature: Double,
    val conditionDescription: String,
    val humidity: Int,
    val windSpeed: Double
)

data class OpenMeteoResponse(
    val current: CurrentUnits
)

data class CurrentUnits(
    val temperature_2m: Double,
    val relative_humidity_2m: Int,
    val wind_speed_10m: Double,
    val weather_code: Int
)

interface OpenMeteoApi {
    @GET("v1/forecast")
    suspend fun getForecast(
        @Query("latitude") lat: Double,
        @Query("longitude") lon: Double,
        @Query("current") current: String = "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
    ): OpenMeteoResponse
}

class WeatherRepository {
    private val api: OpenMeteoApi = Retrofit.Builder()
        .baseUrl("https://api.open-meteo.com/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(OpenMeteoApi::class.java)

    suspend fun fetchWeatherForCity(name: String): WeatherModel {
        val response = api.getForecast(40.4168, -3.7038)
        return WeatherModel(
            cityName = name,
            temperature = response.current.temperature_2m,
            conditionDescription = "Monitoreado en tiempo real",
            humidity = response.current.relative_humidity_2m,
            windSpeed = response.current.wind_speed_10m
        )
    }
}`
    },
    {
      filename: 'build.gradle.kts',
      description: 'Configuración Gradle de Android con dependencias Compose y Retrofit',
      code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.compose.compiler)
}

android {
    namespace = "com.example.climb"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.climb"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        compose = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
}`
    }
  ];
}
