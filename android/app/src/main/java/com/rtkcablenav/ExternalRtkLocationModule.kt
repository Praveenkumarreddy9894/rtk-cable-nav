package com.rtkcablenav

import android.location.Location
import android.location.LocationManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class ExternalRtkLocationModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "ExternalRtkLocationModule"

  @ReactMethod
  fun pushRtkLocationToAndroid(location: ReadableMap) {
    // In production, register a mock/test provider from app permissions and push here.
    // This keeps React Native and Android consumers aligned to the same external RTK source.
    val manager = reactContext.getSystemService(LocationManager::class.java) ?: return
    val provider = LocationManager.GPS_PROVIDER
    val loc = Location(provider).apply {
      latitude = location.getDouble("latitude")
      longitude = location.getDouble("longitude")
      altitude = location.getDouble("altitude")
      accuracy = location.getDouble("accuracy").toFloat()
      time = location.getDouble("timestamp").toLong()
    }

    // Requires mock location permission and provider enablement in field profile builds.
    try {
      manager.setTestProviderLocation(provider, loc)
    } catch (_: Exception) {
      // Keep app running even if device policy blocks test provider.
    }
  }
}
