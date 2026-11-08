package expo.modules.termuxbridge

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import androidx.core.content.ContextCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.atomic.AtomicInteger

class TermuxBridgeModule : Module() {
  private val requestIds = AtomicInteger(1000)
  private val termuxPackage = "com.termux"
  private val resultBundleKey = "com.termux.service.EXTRA_PLUGIN_RESULT_BUNDLE"
  private val stdoutKey = "stdout"
  private val stderrKey = "stderr"
  private val exitCodeKey = "exit_code"
  private val errorKey = "errmsg"

  override fun definition() = ModuleDefinition {
    Name("TermuxBridge")

    Function("isAvailable") {
      val context = appContext.reactContext ?: return@Function false
      return@Function try {
        context.packageManager.getPackageInfo(termuxPackage, 0)
        true
      } catch (_: Exception) {
        false
      }
    }

    AsyncFunction("runCommand") { command: String, workdir: String?, background: Boolean, promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.reject("NO_CONTEXT", "Android context unavailable", null)
        return@AsyncFunction
      }
      try {
        context.packageManager.getPackageInfo(termuxPackage, 0)
      } catch (_: Exception) {
        promise.reject("TERMUX_NOT_INSTALLED", "Install Termux from F-Droid before running commands.", null)
        return@AsyncFunction
      }
      val requestId = requestIds.incrementAndGet()
      val resultAction = "expo.modules.termuxbridge.RESULT_$requestId"
      val receiver = object : BroadcastReceiver() {
        override fun onReceive(receiverContext: Context, resultIntent: Intent) {
          try {
            val bundle: Bundle? = resultIntent.getBundleExtra(resultBundleKey)
            if (bundle == null) {
              promise.reject("TERMUX_NO_RESULT", "Termux returned no result bundle.", null)
              return
            }
            val output = mapOf(
              "stdout" to (bundle.getString(stdoutKey) ?: ""),
              "stderr" to (bundle.getString(stderrKey) ?: ""),
              "exitCode" to bundle.getInt(exitCodeKey, -1),
              "error" to (bundle.getString(errorKey) ?: "")
            )
            promise.resolve(output)
          } finally {
            try { receiverContext.unregisterReceiver(this) } catch (_: Exception) { }
          }
        }
      }
      ContextCompat.registerReceiver(context, receiver, IntentFilter(resultAction), ContextCompat.RECEIVER_EXPORTED)
      val callbackIntent = Intent(resultAction).setPackage(context.packageName)
      val callback = PendingIntent.getBroadcast(
        context,
        requestId,
        callbackIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
      )
      val termuxIntent = Intent("com.termux.RUN_COMMAND").apply {
        setClassName(termuxPackage, "com.termux.app.RunCommandService")
        putExtra("com.termux.RUN_COMMAND_PATH", "/data/data/com.termux/files/usr/bin/bash")
        putStringArrayListExtra("com.termux.RUN_COMMAND_ARGUMENTS", arrayListOf("-lc", command))
        putExtra("com.termux.RUN_COMMAND_WORKDIR", workdir ?: "~/")
        putExtra("com.termux.RUN_COMMAND_BACKGROUND", background)
        putExtra("com.termux.RUN_COMMAND_SESSION_ACTION", "0")
        putExtra("com.termux.RUN_COMMAND_PENDING_INTENT", callback)
      }
      try {
        context.startService(termuxIntent)
      } catch (error: SecurityException) {
        try { context.unregisterReceiver(receiver) } catch (_: Exception) { }
        promise.reject("TERMUX_PERMISSION", "Enable Termux RUN_COMMAND permission and allow-external-apps.", error)
      } catch (error: Exception) {
        try { context.unregisterReceiver(receiver) } catch (_: Exception) { }
        promise.reject("TERMUX_START_FAILED", error.message ?: "Could not start Termux command.", error)
      }
    }
  }
}
