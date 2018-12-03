var fingerprintData = {};
var finalData = {};
var actual_JSON;
var permissionsList = [];
var geoFlag = false;
var medFlag1 = false;
var medFlag2 = false;
var notiFlag = false;
var pushFlag = false;
var midiFlag = false;
var geoPermission = 'N/A';
var notifPermission = 'N/A';
var pushPermission = 'N/A';
var midiPermission = 'N/A';
var permissionsListObj = {};
// time stamp of the fingerprint
fingerprintData['timestamp'] = Date.now();

// // global window error handler
// window.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
//     var error = {};
//     var d = new Date();
//     var time = d.toDateString() + "," + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
//     error['Timestamp'] = time;
//     error['UserAgent'] = navigator.userAgent;
//     error['Error'] = errorMsg;
//     error['Script'] = url;
//     error['Line'] = lineNumber;
//     error['Column'] = column;
//     error['StackTrace'] = errorObj;
//     console.log("In window.onerror" + error);
//     sendToServer(error);
//   };

// try catch wrapper
var wrap = function(func) {
  return function() {
    try {
      func.apply(this, arguments);
    } catch (error) {
      //console.log(error.message, "from", error.stack);
      var errorD = {};
      var d = new Date();
      var time = d.toDateString() + "," + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
      errorD['Timestamp'] = time;
      errorD['UserAgent'] = navigator.userAgent;
      errorD['Error'] = error.stack;
      errorD['ErrorMessage'] = error.message;
      sendToServer(errorD);
      console.log("In wraper" + JSON.stringify(errorD));
    }
  };
};


var getLocationInfoR = wrap(getLocationInfo);
var requestMidiAccessR = wrap(requestMidiAccess);
var notificationsPermissionRequestR = wrap(notificationsPermissionRequest);
var mediaDevicesPermissionsRequestR = wrap(mediaDevicesPermissionsRequest);
var getHttpHeadersInfoR = wrap(getHttpHeadersInfo);
var getWeglRendererAndVendorInfoR = wrap(getWeglRendererAndVendorInfo);
var getBrowserInfoR = wrap(getBrowserInfo);
var getDeviceLightInfoR = wrap(getDeviceLightInfo);
var getDeviceOrientationInfoR = wrap(getDeviceOrientationInfo);
var getDeviceProximityInfoR = wrap(getDeviceProximityInfo);
var getDeviceMotionInfoR = wrap(getDeviceMotionInfo);
var getdeviceBatteryInfoR = wrap(getdeviceBatteryInfo);
var getMediaDevicesInfoR = wrap(getMediaDevicesInfo);
var getFingerprint2LibraryInfoR = wrap(getFingerprint2LibraryInfo);
var getDetectRtcLibraryInfoR = wrap(getDetectRtcLibraryInfo);
var audioFingerprintInfoR = wrap(audioFingerprintInfo);
var mimeTypeInfoR = wrap(mimeTypeInfo);
var connectionTypeInfoR = wrap(connectionTypeInfo);
var getBrowserMediaPermissionsInfoR = wrap(getBrowserMediaPermissionsInfo);
var getBrowserGeoLocationPermissionsInfoR = wrap(getBrowserGeoLocationPermissionsInfo);
var getBrowserNotificationPermissionsInfoR = wrap(getBrowserNotificationPermissionsInfo);
var getBrowserPushNotificationPermissionsInfoR = wrap(getBrowserPushNotificationPermissionsInfo);
var getBrowserMIDIPermissionsInfoR = wrap(getBrowserMIDIPermissionsInfo);
var getBrowserPermissionsInfoR = wrap(getBrowserPermissionsInfo);
var cleanDataR = wrap(cleanData);
var printOnScreenR = wrap(printOnScreen);
var sendToServerR = wrap(sendToServer);
var functionCallFacadeR = wrap(functionCallFacade);
var mainEntryFunctionR = wrap(mainEntryFunction);
var mediaRecorderAudioInfoR = wrap(mediaRecorderAudioInfo);
var mediaRecorderVideoInfoR = wrap(mediaRecorderVideoInfo);
var enabledPluginInfoR = wrap(enabledPluginInfo);
var audioContextPropertiesInfoR = wrap(audioContextPropertiesInfo);
var audioScillatorCompressorInfoR = wrap(audioScillatorCompressorInfo);
var getInstalledFontsUsingJSR = wrap(getInstalledFontsUsingJS);
var functionCallFacade2R = wrap(functionCallFacade2);
//var getInstalledFontsUsingFlashR= wrap(getInstalledFontsUsingFlash);

// read cookies helper function
function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Extra header information from the server
function getHttpHeadersInfo() {
  var session_id = readCookie('session_id');
  if (session_id) {
    fingerprintData['session_id'] = session_id;
  }
  var tempString = readCookie('httpHeaders');
  tempString = decodeURIComponent(tempString);

  if (tempString) {
    tempString = JSON.parse(tempString);
    //console.log('In getHttpHeadersInfo' + JSON.stringify(tempString));
    for (var key in tempString) {
      if (tempString.hasOwnProperty(key)) {
        fingerprintData[key] = tempString[key];
        //console.log('In getHttpHeadersInfo' + fingerprintData[key]);
      }
    }
  }
}


// webgl vendor and renderer
function getWeglRendererAndVendorInfo() {
  var canvas = document.getElementById('my_Canvas');
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') || canvas.getContext('webgl2');
  if (!gl) {
    fingerprintData['webgl_vendor'] = 'N/A';
    fingerprintData['webgl_renderer'] = 'N/A';
    return;
  }

  var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

  if (!debugInfo) {
    fingerprintData['webgl_vendor'] = 'N/A';
    fingerprintData['webgl_renderer'] = 'N/A';
    return;
  }

  var vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
  var renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  fingerprintData['webgl_vendor'] = vendor;
  fingerprintData['webgl_renderer'] = renderer;

}

// AmbientLight
function getDeviceLightInfo() {
  var isOnDeviceLightSupported = 'ondevicelight' in window;
  var isAmbientLightSensorSupported = 'AmbientLightSensor' in window;
  var tempArry = [];
  var callback = function(event) {
    tempArry.push(event.value);
  };
  if (isOnDeviceLightSupported) {
    window.addEventListener('devicelight', callback, false);
    setTimeout(function() {
      window.removeEventListener('devicelight', callback, false);
      fingerprintData['device_light'] = tempArry.slice(0, 5000); //Ashwin's fault
    }, 1000);

  } else if (isAmbientLightSensorSupported) {
    var sensor = new AmbientLightSensor();
    sensor.onreading = function() {
      tempArry.push(sensor.illuminance);
      console.log('Current light level:', sensor.illuminance);
    };
    sensor.onerror = function(event) {
      console.log(event.error.name, event.error.message);
    };
    sensor.start();
    setTimeout(function() {
      fingerprintData['device_light'] = tempArry.slice(0, 5000); //Ashwin's fault
      sensor.stop();
    }, 1000);

  } else {
    fingerprintData['device_light'] = 'N/A';
  }
}

// Device_Orientation
function getDeviceOrientationInfo() {
  var isDeviceOrientationSupported = 'DeviceOrientationEvent' in window;
  var tempArry = [];
  var callback = function(event) {

    var orientation = {};
    orientation['orientation_beta'] = event.beta;
    orientation['orientation_gamma'] = event.gamma;
    orientation['orientation_alpha'] = event.alpha;
    tempArry.push(orientation);
  };

  if (isDeviceOrientationSupported) {
    window.addEventListener('deviceorientation', callback, false);

    setTimeout(function() {
      window.removeEventListener('deviceorientation', callback, false);
      fingerprintData['device_orientation'] = tempArry.slice(0, 5000); //Ashwin's fault
    }, 1000);

  } else {
    fingerprintData['device_orientation'] = 'N/A';
  }
}

// device_proximity
function getDeviceProximityInfo() {
  var isOnDeviceProximitySupported = 'ondeviceproximity' in window;
  var tempArry = [];
  var callback = function(event) {
    var proximity = {};
    proximity['max_proximity'] = event.max;
    proximity['min_proximity'] = event.min;
    proximity['current_proximity'] = event.value;
    tempArry.push(proximity);

  };
  if (isOnDeviceProximitySupported) {
    window.ondeviceproximity = callback;
    setTimeout(function() {
      window.removeEventListener('ondeviceproximity', callback, false);
      fingerprintData['device_proximity'] = tempArry.slice(0, 5000);
    }, 1000);
    //

  } else {
    fingerprintData['device_proximity'] = 'N/A';
  }
}

// device motion
function getDeviceMotionInfo() {
  var isDeviceMotionSupported = 'devicemotion' in window;
  var isOnDeviceMotionSupported = 'ondevicemotion' in window;
  var tempArry = [];

  var callback = function(event) {

    var motion = {};
    motion['x_axis_acceleration'] = event.acceleration.x;
    motion['y_axis_acceleration'] = event.acceleration.y;
    motion['z_axis_acceleration'] = event.acceleration.z;
    motion['x_axis_acceleration_including_gravity'] = event.accelerationIncludingGravity.x;
    motion['y_axis_acceleration_including_gravity'] = event.accelerationIncludingGravity.y;
    motion['z_axis_acceleration_including_gravity'] = event.accelerationIncludingGravity.z;
    motion['x_axis_rotation'] = event.rotationRate.beta;
    motion['y_axis_rotation'] = event.rotationRate.gamma;
    motion['z_axis_rotation'] = event.rotationRate.alpha;
    motion['interval'] = event.interval;
    tempArry.push(motion);

  };
  if (isDeviceMotionSupported) {
    window.addEventListener('devicemotion', callback, false);
    setTimeout(function() {
      window.removeEventListener('devicemotion', callback, false);
      fingerprintData['device_motion'] = tempArry.slice(0, 5000);
    }, 1000);
  } else if (isOnDeviceMotionSupported) {
    window.ondevicemotion = callback;
    setTimeout(function() {
      window.removeEventListener('ondevicemotion', callback, false);
      fingerprintData['device_motion'] = tempArry.slice(0, 5000);
    }, 1000);
  } else {
    fingerprintData['device_motion'] = 'N/A';
  }
}

// battery information
function getdeviceBatteryInfo() {
  var isBatteryAPISupported = 'battery' in navigator;
  var batteryObj = {};
  if ('getBattery' in navigator) {
    var battery = navigator.battery || navigator.mozBattery || navigator.webkitBattery;
    //var batteryTempStore = [];
    navigator.getBattery().then(function(battery) {
      batteryObj["battery_charging"] = battery.charging;
      batteryObj["battery_level"] = battery.level;
      batteryObj["battery_charging_time"] = battery.chargingTime;
      batteryObj["battery_discharging_time"] = battery.dischargingTime;
      fingerprintData['battery_info'] = batteryObj;
    });

  } else if ('battery' in navigator) {
    var battery = navigator.battery || navigator.mozBattery || navigator.webkitBattery;
    batteryObj["battery_charging"] = battery.charging;
    batteryObj["battery_level"] = battery.level;
    batteryObj["battery_charging_time"] = battery.chargingTime;
    batteryObj["battery_discharging_time"] = battery.dischargingTime;
    fingerprintData['battery_info'] = batteryObj;
  } else {
    fingerprintData['battery_info'] = 'N/A';
  }
}

// media devices
function getMediaDevicesInfo() {
  if (navigator.mediaDevices) {
    var tempStore = [];
    navigator.mediaDevices.enumerateDevices()
      .then(function(devices) {
        devices.forEach(function(device) {
          var tempObj = {};
          tempObj['device_kind'] = device.kind;
          tempObj['device_label'] = device.label;
          tempObj['device_id'] = device.deviceId;
          tempObj['device_group_id'] = device.groupId;
          // var devices = device.kind + ": " + device.label +
          //   " id = " + device.deviceId;
          tempStore.push(tempObj);
        });
      })
      .catch(function(err) {
        console.log(err.name + ": " + err.message);
      });

    fingerprintData['media_devices'] = tempStore;
  } else {
    fingerprintData['media_devices'] = 'N/A';
  }
}

// permission query for webcam and microphone
function getBrowserMediaPermissionsInfo() {

  var deferred = $.Deferred();
  var hasWebRTC = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
  if (hasWebRTC) {

    try {
      DetectRTC.load(function() {
        //fingerprintData['is_website_hasWebcam_permissions'] = DetectRTC.isWebsiteHasWebcamPermissions;
        //console.log(DetectRTC.isWebsiteHasWebcamPermissions);
        if (DetectRTC.isWebsiteHasWebcamPermissions) {
          //permissionsList.push('webcam: granted');
          permissionsListObj["webcam"] = 'granted';
        } else if (medFlag1) {
          permissionsListObj["webcam"] = 'granted';
        } else if (medFlag2) {
          permissionsListObj["webcam"] = 'denied';
        } else {
          permissionsListObj["webcam"] = 'denied';
        }
        //fingerprintData['is_website_hasMicrophone_permissions'] = DetectRTC.isWebsiteHasMicrophonePermissions;
        //console.log(DetectRTC.isWebsiteHasMicrophonePermissions);
        if (DetectRTC.isWebsiteHasMicrophonePermissions) {
          permissionsListObj["microphone"] = 'granted';
        } else if (medFlag1) {
          permissionsListObj["microphone"] = 'granted';

        } else if (medFlag2) {
          permissionsListObj["microphone"] = 'denied';
        } else {
          permissionsListObj["microphone"] = 'denied';

        }
        deferred.resolve("In DetectRTC");
      });

    } catch (error) {
      permissionsListObj["webcam"] = 'N/A';
      permissionsListObj["microphone"] = 'N/A';
      //console.log(error.message, "from", error.stack);
      var errorD = {};
      var d = new Date();
      var time = d.toDateString() + "," + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
      errorD['Timestamp'] = time;
      errorD['UserAgent'] = navigator.userAgent;
      errorD['Error'] = error.stack;
      errorD['ErrorMessage'] = error.message;
      sendToServer(errorD);
      console.log(JSON.stringify(errorD));
      deferred.resolve(error);

    }

  } else {
    permissionsListObj["webcam"] = 'N/A';
    permissionsListObj["microphone"] = 'N/A';
    return deferred.resolve("webcam and microphone").promise();

  }
  return deferred.promise();
}

//permission query for geolocation
function getBrowserGeoLocationPermissionsInfo() {
  var deferred = $.Deferred();
  if (navigator.permissions) {
    navigator.permissions.query({
      name: 'geolocation'
    }).then(function(result) {
      if (result.state == 'granted') {
        permissionsListObj["geolocation"] = 'granted';
      } else if (result.state == 'prompt') {
        if (geoFlag) {
          permissionsListObj["geolocation"] = geoPermission;
        } else {
          permissionsListObj["geolocation"] = 'prompt';
        }
      } else if (result.state == 'denied') {
        permissionsListObj["geolocation"] = 'denied';
      } else {
        permissionsListObj["geolocation"] = 'N/A';
      }
      deferred.resolve(result);
    }).catch(function(e) {
      permissionsListObj["geolocation"] = 'N/A';
      console.log(e); // "oh, no!"
      sendToServerR(e);
      deferred.resolve(e);
    });

  } else {
    if (geoFlag) {
      permissionsListObj["geolocation"] = geoPermission;
    } else {
      permissionsListObj["geolocation"] = geoPermission;
    }

    return deferred.resolve("geolocation").promise();
  }

  return deferred.promise();
}

//permission query for notifications
function getBrowserNotificationPermissionsInfo() {
  var deferred = $.Deferred();
  if (navigator.permissions) {
    navigator.permissions.query({
      name: 'notifications'
    }).then(function(result) {
      if (result.state == 'granted') {
        permissionsListObj["notifications"] = 'granted';
      } else if (result.state == 'prompt') {
        if (notiFlag) {
          permissionsListObj["notifications"] = notifPermission;
        } else {
          permissionsListObj["notifications"] = 'prompt';
        }
      } else if (result.state == 'denied') {
        permissionsListObj["notifications"] = 'denied';
      } else {
        permissionsListObj["notifications"] = 'N/A';
      }
      deferred.resolve(result);
    }).catch(function(e) {
      permissionsListObj["notifications"] = 'N/A';
      console.log(e); // "oh, no!"
      deferred.resolve(e);
    });

  } else {
    if (notiFlag) {
      permissionsListObj["notifications"] = notifPermission;
    } else {
      permissionsListObj["notifications"] = notifPermission;
    }

    return deferred.resolve("notifications").promise();
  }

  return deferred.promise();
}

//permission query for push notifications
function getBrowserPushNotificationPermissionsInfo() {
  var deferred = $.Deferred();
  if (navigator.permissions) {
    navigator.permissions.query({
      name: 'push',
      userVisibleOnly: true
    }).then(function(result) {
      if (result.state == 'granted') {
        permissionsListObj["push"] = 'granted';
      } else if (result.state == 'prompt') {
        if (notiFlag) {
          permissionsListObj["push"] = notifPermission;
        } else {
          permissionsListObj["push"] = 'prompt';
        }
      } else if (result.state == 'denied') {
        permissionsListObj["push"] = 'denied';
      } else {
        permissionsListObj["push"] = 'N/A';
      }
      deferred.resolve(result);
    }).catch(function(e) {
      permissionsListObj["push"] = 'N/A';
      console.log(e); // "oh, no!"
      deferred.resolve(e);
    });

  } else {
    if (notiFlag) {
      permissionsListObj["push"] = notifPermission;
    } else {
      permissionsListObj["push"] = pushPermission;
    }

    return deferred.resolve("push notifications").promise();
  }

  return deferred.promise();
}

//permission query for push notifications
function getBrowserMIDIPermissionsInfo() {
  var deferred = $.Deferred();
  if (navigator.permissions) {
    navigator.permissions.query({
      name: 'midi',
      sysex: true
    }).then(function(result) {
      if (result.state == 'granted') {
        permissionsListObj["midi"] = 'granted';
      } else if (result.state == 'prompt') {
        if (midiFlag) {
          permissionsListObj["midi"] = midiPermission;
        } else {
          permissionsListObj["midi"] = 'prompt';
        }
      } else if (result.state == 'denied') {
        permissionsListObj["midi"] = 'denied';
      } else {
        permissionsListObj["midi"] = 'N/A';
      }
      deferred.resolve(result);
    }).catch(function(e) {
      permissionsListObj["midi"] = 'N/A';
      console.log(e); // "oh, no!"
      deferred.resolve(e);
    });

  } else {
    if (midiFlag) {
      permissionsListObj["midi"] = midiPermission;
    } else {
      permissionsListObj["midi"] = midiPermission;

    }


    return deferred.resolve("Midi").promise();

  }

  return deferred.promise();
}

function getBrowserPermissionsInfo(key) {
  var key = key;
  var d = jQuery.Deferred(),
    p = d.promise();
  //You can chain jQuery promises using .then
  p.then(getBrowserMediaPermissionsInfo)
    .then(getBrowserGeoLocationPermissionsInfo)
    .then(getBrowserNotificationPermissionsInfo)
    .then(getBrowserPushNotificationPermissionsInfo)
    .then(getBrowserMIDIPermissionsInfo)
    .then(function(value) {
      fingerprintData[key] = permissionsListObj;
      console.log(key + ":" + fingerprintData[key]);
      permissionsListObj = {};
    });
  d.resolve();

}

// from Fingerprint2
function getFingerprint2LibraryInfo() {
  var fp = new Fingerprint2();
  var tempObj = {};
  fp.get(function(result, components) {
    for (var index in components) {
      var obj = components[index];
      var value = obj.value;
      var key = obj.key;
      //fingerprintData[key] = value.toString();
      tempObj[key] = value;
    }
    fingerprintData['user_agent'] = tempObj['user_agent'];
    fingerprintData['preferred_language'] = tempObj['language'];
    fingerprintData['color_depth'] = tempObj['color_depth'];
    fingerprintData['pixel_ratio'] = tempObj['pixel_ratio'];
    fingerprintData['hardware_concurrency'] = tempObj['hardware_concurrency'];
    fingerprintData['screen_resolution'] = tempObj['resolution'];
    fingerprintData['available_screen_resolution'] = tempObj['available_resolution'];
    fingerprintData['timezone_offset'] = tempObj['timezone_offset'];
    fingerprintData['session_storage'] = tempObj['session_storage'];
    fingerprintData['local_storage'] = tempObj['local_storage'];
    fingerprintData['indexed_db'] = tempObj['indexed_db'];
    fingerprintData['open_database'] = tempObj['open_database'];
    fingerprintData['cpu_class'] = tempObj['cpu_class'];
    fingerprintData['navigator_platform'] = tempObj['navigator_platform'];

    if (tempObj['do_not_track'] == 1) {
      fingerprintData['do_not_track'] = true;
    } else {
      fingerprintData['do_not_track'] = false;
    }

    if (tempObj['regular_plugins'].length > 0) {
      //console.log(tempObj['regular_plugins']);
      fingerprintData['regular_plugins'] = tempObj['regular_plugins'];
    } else {

      fingerprintData['regular_plugins'] = 'N/A';
    }

    fingerprintData['canvas_fonts'] = tempObj['js_fonts'];
    fingerprintData['canvas'] = tempObj['canvas'];
    fingerprintData['webgl'] = tempObj['webgl'];
    fingerprintData['adblock'] = tempObj['adblock'];
    fingerprintData['has_lied_languages'] = tempObj['has_lied_languages'];
    fingerprintData['has_lied_resolution'] = tempObj['has_lied_resolution'];
    fingerprintData['has_lied_os'] = tempObj['has_lied_os'];
    fingerprintData['has_lied_browser'] = tempObj['has_lied_browser'];
    fingerprintData['touch_support'] = tempObj['touch_support'];
  });



}

// get browser information
function getBrowserInfo() {

  if (window.navigator.appName) {
    //AddRowToInfo ("Name of the browser (appName)", window.navigator.appName);
    fingerprintData['browser_name'] = window.navigator.appName;
  }

  if (window.navigator.vendor) {
    //AddRowToInfo ("Name of the browser vendor (vendor)", window.navigator.vendor);
    fingerprintData['browser_vendor'] = window.navigator.vendor;
  }
  if (window.navigator.appCodeName) {
    //AddRowToInfo ("Code name of the browser (appCodeName)", window.navigator.appCodeName);
    fingerprintData['browser_code_name'] = window.navigator.appCodeName;
  }
  if (window.navigator.product) {
    //AddRowToInfo ("Engine of the browser (product)", window.navigator.product);
    fingerprintData['browser_engine'] = window.navigator.product;
  }
  if (window.navigator.productSub) {
    //AddRowToInfo ("Build number of the browser engine (productSub)", window.navigator.productSub);
    fingerprintData['browser_engine_build_number'] = window.navigator.productSub;
  }


  if (window.opera) {
    //AddRowToInfo ("Build number of the browser (buildNumber)", window.opera.buildNumber ());
    fingerprintData['browser_build_number'] = window.opera.buildNumber();
    //AddRowToInfo ("Version number of the browser (version)", window.opera.version ());
    fingerprintData['browser_version_number'] = window.opera.version();

  }
  if (window.navigator.appVersion) {
    //AddRowToInfo ("Version and platform of the browser (appVersion)", window.navigator.appVersion);
    fingerprintData['browser_version_and_platform'] = window.navigator.appVersion;
  }
  if (window.navigator.vendorSub) {
    //AddRowToInfo ("Version of the browser given by the vendor (vendorSub)", window.navigator.vendorSub);
    fingerprintData['browser_vendor_version'] = window.navigator.vendorSub;
  }
  if (window.navigator.appMinorVersion) {
    //AddRowToInfo ("Minor version of the browser (appMinorVersion)", window.navigator.appMinorVersion);
    fingerprintData['browser_minor_version'] = window.navigator.appMinorVersion;
  }
  if (window.navigator.buildID) {
    //AddRowToInfo ("Build identifier of the browser (buildID)", window.navigator.buildID);
    fingerprintData['browser_buildID'] = window.navigator.buildID;
  }
  if (window.navigator.systemLanguage) {
    //AddRowToInfo ("Language of the installed operating system (systemLanguage)", window.navigator.systemLanguage);
    fingerprintData['operating system_language'] = window.navigator.systemLanguage;
  }
  if (window.navigator.oscpu) {
    //AddRowToInfo ("Information about the OS and CPU (oscpu)", window.navigator.oscpu);
    fingerprintData['os_and_cpu'] = window.navigator.oscpu;
  }
  //AddRowToInfo ("Cookies are enabled (cookieEnabled)", window.navigator.cookieEnabled);
  fingerprintData['cookies_enabled'] = window.navigator.cookieEnabled;

}

// from DetectRTC
function getDetectRtcLibraryInfo() {
  DetectRTC.load(function() {
    fingerprintData['has_web_cam'] = DetectRTC.hasWebcam;
    fingerprintData['has_microphone'] = DetectRTC.hasMicrophone;
    fingerprintData['has_speakers'] = DetectRTC.hasSpeakers;
    fingerprintData['audio_input_devices'] = DetectRTC.audioInputDevices;
    fingerprintData['audio_output_devices'] = DetectRTC.audioOutputDevices;
    //console.log("Drtc" + DetectRTC.audioOutputDevices);
    fingerprintData['video_input_devices'] = DetectRTC.videoInputDevices;
    fingerprintData['os_name'] = DetectRTC.osName;
    fingerprintData['os_version'] = DetectRTC.osVersion;
    fingerprintData['is_private_browsing'] = DetectRTC.browser.isPrivateBrowsing;
    DetectRTC.DetectLocalIPAddress(function(ip) {
      var tempObj = {};
      if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)) {
        tempObj['local'] = ip;
      }
      //assume the rest are public IPs
      else {
        tempObj['public'] = ip;
      }

      fingerprintData['ip_address'] = tempObj;
    });
  });
}

// AudioContext fingerprint
function audioFingerprintInfo() {
  var audioContext = window.AudioContext || window.webkitAudioContext;
  if ("function" !== typeof audioContext)
    fingerprintData['web_audio_fingerprint_oscillator'] = 'N/A';
  else {

    var cc_output = [];
    var audioCtx = new(window.AudioContext || window.webkitAudioContext),
      oscillator = audioCtx.createOscillator(),
      analyser = audioCtx.createAnalyser(),
      gain = audioCtx.createGain(),
      scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);

    gain.gain.value = 0; // Disable volume
    oscillator.type = "triangle"; // Set oscillator to output triangle wave
    oscillator.connect(analyser); // Connect oscillator output to analyser input
    analyser.connect(scriptProcessor); // Connect analyser output to scriptProcessor input
    scriptProcessor.connect(gain); // Connect scriptProcessor output to gain input
    gain.connect(audioCtx.destination); // Connect gain output to audiocontext destination

    scriptProcessor.onaudioprocess = function(bins) {
      bins = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(bins);
      for (var i = 0; i < bins.length; i = i + 1) {
        cc_output.push(bins[i]);
      }
      analyser.disconnect();
      scriptProcessor.disconnect();
      gain.disconnect();
      fingerprintData['web_audio_fingerprint_oscillator'] = cc_output.slice(0, 30);
    };

    oscillator.start(0);
    oscillator.stop(audioCtx.currentTime + 5);

  }

}

// AudioContext properties:
// Performs fingerprint as found in some versions of http://metrics.nt.vc/metrics.js
function a(a, b, c) {
  for (var d in b) "dopplerFactor" === d || "speedOfSound" === d || "currentTime" ===
    d || "number" !== typeof b[d] && "string" !== typeof b[d] || (a[(c ? c : "") + d] = b[d]);
  return a
}

var nt_vc_output;

function audioContextPropertiesInfo() {
  //var tempArry = [];
  try {
    var nt_vc_context = window.AudioContext || window.webkitAudioContext;
    if ("function" !== typeof nt_vc_context)
      nt_vc_output = "N/A";
    else {
      var f = new nt_vc_context,
        d = f.createAnalyser();
      nt_vc_output = a({}, f, "ac_");
      nt_vc_output = a(nt_vc_output, f.destination, "ac_");
      nt_vc_output = a(nt_vc_output, f.listener, "ac_");
      nt_vc_output = a(nt_vc_output, d, "an_");
      //nt_vc_output = window.JSON.stringify(nt_vc_output, undefined, 2);
    }
  } catch (g) {
    nt_vc_output = 0
  }
  //set_result(nt_vc_output, 'nt_vc_result')
  //tempArry.push(nt_vc_output)
  fingerprintData['audio_context_properties'] = nt_vc_output;
}

// Fingerprint using hybrid of OscillatorNode/DynamicsCompressor method:
var hybrid_output = [];

function audioScillatorCompressorInfo() {

  var audioContext = window.AudioContext || window.webkitAudioContext;
  if ("function" !== typeof audioContext)
    fingerprintData['web_audio_fingerprint_oscillator_and_dynamicsCompressor'] = 'N/A';
  else {
    var audioCtx = new(window.AudioContext || window.webkitAudioContext),
      oscillator = audioCtx.createOscillator(),
      analyser = audioCtx.createAnalyser(),
      gain = audioCtx.createGain(),
      scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);

    // Create and configure compressor
    compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold && (compressor.threshold.value = -50);
    compressor.knee && (compressor.knee.value = 40);
    compressor.ratio && (compressor.ratio.value = 12);
    compressor.reduction && (compressor.reduction.value = -20);
    compressor.attack && (compressor.attack.value = 0);
    compressor.release && (compressor.release.value = .25);

    gain.gain.value = 0; // Disable volume
    oscillator.type = "triangle"; // Set oscillator to output triangle wave
    oscillator.connect(compressor); // Connect oscillator output to dynamic compressor
    compressor.connect(analyser); // Connect compressor to analyser
    analyser.connect(scriptProcessor); // Connect analyser output to scriptProcessor input
    scriptProcessor.connect(gain); // Connect scriptProcessor output to gain input
    gain.connect(audioCtx.destination); // Connect gain output to audiocontext destination

    scriptProcessor.onaudioprocess = function(bins) {
      bins = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(bins);
      for (var i = 0; i < bins.length; i = i + 1) {
        hybrid_output.push(bins[i]);
      }
      analyser.disconnect();
      scriptProcessor.disconnect();
      gain.disconnect();
      fingerprintData['web_audio_fingerprint_oscillator_and_dynamicsCompressor'] = hybrid_output.slice(0, 30);
      //set_result(hybrid_output.slice(0,30), 'hybrid_result');
      //draw_fp(bins);
    };

    oscillator.start(0);
    oscillator.stop(audioCtx.currentTime + 5);

  }


}

//
function enabledPluginInfo() {
  var temp = [];

  if (typeof navigator.mimeTypes != "undefined" && navigator.mimeTypes.length > 0) {

    for (var x = 0; x < navigator.mimeTypes.length; x++) {
      if (navigator.mimeTypes[x].enabledPlugin) {
          var temp2 = {};
          temp2["name'"] = navigator.mimeTypes[x].enabledPlugin.name;
          temp2["description"] = navigator.mimeTypes[x].enabledPlugin.description;
          temp.push(temp2);
      }
    }
    console.log("enabledPluginInfo" + temp);
    fingerprintData['enabled_plugin'] = temp;
  } else {
    fingerprintData['enabled_plugin'] = 'N/A';
  }

}

// MediaRecorder API
function mimeTypeInfo() {
  var mimeData = [];
  if (typeof navigator.mimeTypes != "undefined" && navigator.mimeTypes.length > 0) {
    for (var x = 0; x < navigator.mimeTypes.length; x++) {
      var temp2 = {};
     // if (typeof navigator.mimeTypes[x].type != "undefined" && navigator.mimeTypes[x].type != "") {
          temp2["type"] = navigator.mimeTypes[x].type;
          temp2["description"] = navigator.mimeTypes[x].description;
     // }
        if (navigator.mimeTypes[x].enabledPlugin) {
          temp2["plugin_name'"] = navigator.mimeTypes[x].enabledPlugin.name;
          temp2["plugin_description"] = navigator.mimeTypes[x].enabledPlugin.description;
        } else {
           temp2["plugin_name'"] = "N/A";
          temp2["plugin_description"] = "N/A";
        }
        mimeData.push(temp2);
        console.log("mimeTypeInfo" + mimeData);

    }
    fingerprintData['browser_mime_types'] = mimeData;
  } else {
    fingerprintData['browser_mime_types'] = 'N/A';
  }

}

// Audio mimetype
function mediaRecorderVideoInfo() {
  var temp = [];

  if (typeof MediaRecorder !== 'undefined') {

    var videoTypes = [
      "video/webm",
      'video/webm; codecs=vp9',
      "video/webm; codecs=vp9,opus",
      'video/webm; codecs=opus',
      "video/mpeg",
      "video/webm\;codecs=vp8",
      "video/webm\;codecs=daala",
      "video/webm\;codecs=h264",
      "video/ogg",
      "video/mp4"
    ];
    for (var i in videoTypes) {
      if (MediaRecorder.isTypeSupported(videoTypes[i])) {
        temp.push(videoTypes[i]);
      }
    }

    fingerprintData['media_recorder_video_mime_types'] = temp;

  } else {
    fingerprintData['media_recorder_video_mime_types'] = 'N/A';
  }
}


// Audio mimetype
function mediaRecorderAudioInfo() {
  var temp = [];
  if (typeof MediaRecorder !== 'undefined') {
    var audioTypes = [
      "audio/vnd.wave",
      "audio/wave",
      "audio/wav",
      "audio/x-wav",
      "audio/webm",
      "audio/webm\;codecs=opus",
      "audio/mpeg",
      "audio/ogg",
      "audio/vorbis",
      "audio/x-pn-wav",
      "audio/vorbis-config",
      "application/ogg",
      "audio/MPA",
      "audio/mpa-robust",
      "audio/aac",
      "audio/aacp",
      "audio/3gpp",
      "audio/3gpp2",
      "audio/mp4",
      "audio/mp4a-latm",
      "audio/mpeg4-generic",
      "audio/opus",
      "audio/flac",
      "audio/x-flac"
    ];

    for (var i in audioTypes) {
      //var mimeData = {};
      if (MediaRecorder.isTypeSupported(audioTypes[i])) {
        temp.push(audioTypes[i]);
      }
    }

    fingerprintData['media_recorder_audio_mime_types'] = temp;

  } else {
    fingerprintData['media_recorder_audio_mime_types'] = 'N/A';

  }
}

// Network Information API
function connectionTypeInfo() {
  var isConnectionSupported = 'connection' in navigator;
  var tempObj = {};
  if (isConnectionSupported) {
    tempObj['connection_type'] = navigator.connection.type;
    tempObj['max_downlink'] = navigator.connection.downlinkMax;
    fingerprintData['network_information'] = tempObj;

  } else {

    fingerprintData['network_information'] = "N/A";
  }
}

// Font fingerprinting from github.com/Valve/fingerprintjs2/blob/master/fingerprint2.js
var fontList = [
  "Andale Mono", "Arial", "Arial Black", "Arial Hebrew", "Arial MT", "Arial Narrow", "Arial Rounded MT Bold", "Arial Unicode MS",
  "Bitstream Vera Sans Mono", "Book Antiqua", "Bookman Old Style",
  "Calibri", "Cambria", "Cambria Math", "Century", "Century Gothic", "Century Schoolbook", "Comic Sans", "Comic Sans MS", "Consolas", "Courier", "Courier New",
  "Garamond", "Geneva", "Georgia",
  "Helvetica", "Helvetica Neue",
  "Impact",
  "Lucida Bright", "Lucida Calligraphy", "Lucida Console", "Lucida Fax", "LUCIDA GRANDE", "Lucida Handwriting", "Lucida Sans", "Lucida Sans Typewriter", "Lucida Sans Unicode",
  "Microsoft Sans Serif", "Monaco", "Monotype Corsiva", "MS Gothic", "MS Outlook", "MS PGothic", "MS Reference Sans Serif", "MS Sans Serif", "MS Serif", "MYRIAD", "MYRIAD PRO",
  "Palatino", "Palatino Linotype",
  "Segoe Print", "Segoe Script", "Segoe UI", "Segoe UI Light", "Segoe UI Semibold", "Segoe UI Symbol",
  "Tahoma", "Times", "Times New Roman", "Times New Roman PS", "Trebuchet MS", "Ubuntu",
  "Verdana", "Wingdings", "Wingdings 2", "Wingdings 3"
];

function getInstalledFontsUsingJS() {
  var that = this;

  var baseFonts = ["monospace", "sans-serif", "serif"];

  var testString = "mimimimimimimimimimimimimimimimimimimimimimimimimimimi";

  var testSize = "72px";

  var h = document.getElementsByTagName("body")[0];

  var s = document.createElement("span");
  s.style.position = "absolute";
  s.style.left = "-9999px";
  s.style.fontSize = testSize;
  s.innerHTML = testString;
  var defaultWidth = {};
  var defaultHeight = {};
  for (var index = 0, length = baseFonts.length; index < length; index++) {
    //get the default width for the three base fonts
    s.style.fontFamily = baseFonts[index];
    h.appendChild(s);
    defaultWidth[baseFonts[index]] = s.offsetWidth; //width for the default font

    defaultHeight[baseFonts[index]] = s.offsetHeight; //height for the defualt font
    h.removeChild(s);
  }
  var detect = function(font) {
    var detected = false;
    for (var index = 0, l = baseFonts.length; index < l; index++) {
      s.style.fontFamily = font + "," + baseFonts[index]; // name of the font along with the base font for fallback.
      h.appendChild(s);
      var matched = (s.offsetWidth !== defaultWidth[baseFonts[index]] || s.offsetHeight !== defaultHeight[baseFonts[index]]);
      h.removeChild(s);
      detected = detected || matched;
    }
    return detected;
  };

  var available = [];
  var jsInstalledFonts = '';
  var tempArry = [];
  for (var i = 0, l = fontList.length; i < l; i++) {
    if (detect(fontList[i])) {
      // jsInstalledFonts += fontList[i];
      // jsInstalledFonts += ';';
      tempArry.push(fontList[i]);
    }
  }
  fingerprintData['js_css_fonts'] = tempArry;


}

// Flash font detection
// Flash font detection adapted from github.com/Valve/fingerprintjs2/blob/master/fingerprint2.js
// function getInstalledFontsUsingFlash() {
//     if (typeof window.swfobject === "undefined") {
//         console.log("No flash available");
//         return "";
//     }
//     if(!swfobject.hasFlashPlayerVersion("9.0.0")){
//         console.log("Insufficient flash version: need at least 9.0.0");
//         return "";
//     }
//     var hiddenCallback = "___fp_swf_loaded";
//     window[hiddenCallback] = function(fonts) {
//         //set_result(fonts.toString(), "flash_font_result");
//        fingerprintData['flash_fonts'] =  fonts.toString();
//     };
//     var id = "flashfontfp";
//     var node = document.createElement("div");
//     node.setAttribute("id", id);
//     document.body.appendChild(node);
//     var flashvars = { onReady: hiddenCallback};
//     var flashparams = { allowScriptAccess: "always", menu: "false" };
//     swfobject.embedSWF("data/FontList.swf", id, "1", "1", "9.0.0", false, flashvars, flashparams, {});
//}

// // Bluetooth
// function getBluetoothInfo(data) {
//
//      var deferred = $.Deferred();
//      var isBluetoothAPISupported = 'bluetooth' in navigator;
//      if (isBluetoothAPISupported) {
//           navigator.bluetooth.requestDevice({
//           acceptAllDevices: true,
//           optionalServices: ['device_information']
//       }).then(function(device) {
//           console.log('Got device:', device.name);
//           console.log('id:', device.id);
//           fingerprintData['bluetooth'] = device.id;
//           //console.log("Bluetooth: The following error occurred: " + err.name);
//           //getLocationInfo();
//           //resolve(device.id);
//           deferred.resolve(device.id);
//
//
//       }).catch(function(error) {
//           console.log(error);
//           //getLocationInfo();
//           //resolve(error);
//           deferred.resolve(error);
//
//       });
//
//     } else {
//           fingerprintData['bluetooth'] = 'N/A';
//           console.log("Bluetooth not supported");
//           ///getLocationInfo();
//           return deferred.resolve("Bluetooth not supported").promise();
//    }
//
//    return deferred.promise();
//
// }

//device current geolocation
function getLocationInfo(data) {

  var deferred = $.Deferred();
  var options = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 0
  };
  var tempObj = {};

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      var crd = pos.coords;
      tempObj['latitude'] = crd.latitude;
      tempObj['longitude'] = crd.longitude;
      tempObj['accuracy'] = crd.accuracy;
      tempObj['altitude'] = crd.altitude;
      tempObj['altitude_accuracy'] = crd.altitudeAccuracy;
      tempObj['heading'] = crd.heading;
      tempObj['speed'] = crd.speed;
      fingerprintData['device_current_position'] = tempObj;
      geoPermission = 'granted';
      geoFlag = true;
      console.log(geoPermission);
      //mediaDevicesPermissionsRequest();
      //resolve(geoPermission);
      deferred.resolve(geoPermission);
    }, function(err) {

      geoPermission = 'denied';
      geoFlag = true;
      fingerprintData['device_current_position'] = err.name;
      console.log("GeoLocation: The following error occurred: " + err.name);
      //mediaDevicesPermissionsRequest();
      //resolve(err.name);
      deferred.resolve(err.name);


    }, options);
  } else {
    fingerprintData['device_current_position'] = 'N/A';
    console.log("getLocation not supported");
    //mediaDevicesPermissionsRequest();
    //resolve('start');
    return deferred.resolve("getLocation not supported").promise();
  }

  return deferred.promise();

}

// media permissions request
function mediaDevicesPermissionsRequest(data) {


  var deferred = $.Deferred();
  var mediaStream = null;
  navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

  if (navigator.getUserMedia) {
    navigator.getUserMedia({
      audio: true,
      video: true
    }, function(stream) {
      //notificationsPermissionRequest();
      console.log(stream);
      mediaStream = stream;
      medFlag1 = true;
      mediaStream.stop = function() {
        this.getAudioTracks().forEach(function(track) {
          track.stop();
        });
        this.getVideoTracks().forEach(function(track) {
          track.stop();
        });
      };
      mediaStream.stop();
      //resolve('start');
      deferred.resolve(stream);

    }, function(err) {
      medFlag2 = true;
      console.log("GetUserMedia: The following error occurred: " + err.name);
      //notificationsPermissionRequest();
      //resolve("GetUserMedia: The following error occurred: " + err.name);
      deferred.resolve("GetUserMedia: The following error occurred: " + err.name);

    });
  } else {

    console.log("getUserMedia not supported");
    //notificationsPermissionRequest()
    //resolve("getUserMedia not supported");
    return deferred.resolve("getUserMedia not supported").promise();

  }
  return deferred.promise();

}

// notifications permission_query
function notificationsPermissionRequest(data) {

  var deferred = $.Deferred();
  try {
    Notification.requestPermission()
      .then(function(result) {
        console.log(result);
        notifPermission = result;
        notiFlag = true;
        //requestMidiAccess();
        //resolve("notifications :  " + result );
        deferred.resolve("notifications:" + result);
      });
  } catch (error) {
    // Safari doesn't return a promise for requestPermissions and it
    // throws a TypeError. It takes a callback as the first argument
    // instead.
    if (error instanceof TypeError) {
      Notification.requestPermission(function(result) {
        console.log(result);
        notiFlag = true;
        notifPermission = result;
        //requestMidiAccess();
        //resolve("notifications : " + result);
        deferred.resolve("notifications:  " + result);

      });
    } else {
      console.log(error);
      notifPermission = 'N/A';
      //requestMidiAccess();
      //resolve('notifications:N/A');
      return deferred.resolve("notifications:'N/A'").promise();

    }
  }

  return deferred.promise();

}

// midi permission request
function requestMidiAccess() {


  var deferred = $.Deferred();
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
      sysex: true
    }).then(function(s) {
      console.log('midi: granted');
      midiPermission = 'granted';
      midiFlag = true;
      //functionCallFacadeTwo();
      deferred.resolve('midi: granted');
    }, function(e) {
      console.log('midi denied');
      midiPermission = 'denied';
      midiFlag = true;
      //functionCallFacadeTwo();
      //resolve('midi:denied');
      deferred.resolve('midi: denied');

    });
  } else {
    console.log('midi: N/A');
    midiPermission = 'N/A';
    //functionCallFacadeTwo();
    //resolve('midi:N/A');
    return deferred.resolve('midi: N/A').promise();

  }

  return deferred.promise();

}

/**
 * Sort JavaScript Object
 * CF Webtools : Chris Tierney
 * obj = object to sort
 * order = 'asc' or 'desc'
 */
function sortObj(obj, order) {
  "use strict";

  var key,
    tempArry = [],
    i,
    tempObj = {};

  for (key in obj) {
    tempArry.push(key);
  }

  tempArry.sort(
    function(a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    }
  );

  if (order === 'desc') {
    for (i = tempArry.length - 1; i >= 0; i--) {
      tempObj[tempArry[i]] = obj[tempArry[i]];
    }
  } else {
    for (i = 0; i < tempArry.length; i++) {
      tempObj[tempArry[i]] = obj[tempArry[i]];
    }
  }

  return tempObj;
}

// clean data
function cleanData() {

  //console.log('In cleanData fingerprintData' +  JSON.stringify(fingerprintData));
  for (var key in fingerprintData) {
    if (fingerprintData.hasOwnProperty(key)) {
      if (fingerprintData[key] == undefined || fingerprintData[key].length == 0) {
        //console.log('In cleanData fingerprintData' + key +  fingerprintData[key]);
        fingerprintData[key] = "N/A";
      }
    }

  }

  //console.log('In cleanData in actual_JSON' + JSON.stringify(actual_JSON));
  for (var key in actual_JSON) {
    if (actual_JSON.hasOwnProperty(key)) {
      if (fingerprintData[key] == undefined) {
        //console.log('In cleanData in actual_JSON' + key +  fingerprintData[key]);
        fingerprintData[key] = "N/A";
      }

      finalData[key] = fingerprintData[key];
      finalData = sortObj(finalData, 'asc');
    }


  }

}

// load json file
function loadJSON(callback) {

  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', 'data/variables.json', true); // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = function() {
    if (xobj.readyState == 4 && xobj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

// print on screen
function printOnScreen() {
  var output = document.getElementById("out");
  output.innerHTML = "<table class='table table-striped' " + " id='table_div'> " +
    "<tbody> </tbody></table>";

  actual_JSON = sortObj(actual_JSON, 'asc');
  for (var key in actual_JSON) {

    var value = JSON.stringify(finalData[key]);
    var desc = actual_JSON[key];
    if (value.length > 250) {

      $("#table_div").append("<tr data-toggle='collapse' data-target='#" + key + "' class='accordion-toggle' ><td class='col-md-2'>" + key + "</td> <td class='col-md-4'>" + desc + "</td> <td class='col-md-6'>" + value.substring(0, 100) + "<button type='button'> More >> </button>" + " </td></tr>" +
        "<tr><td colspan='3' class='hiddenRow'> <div class='accordion-body collapse' id='" + key + "'>" + value.substring(0, 1000) + "</div> </td></tr>");

    } else if (finalData[key] instanceof Array) {

      $("#table_div").append("<tr><td class='col-md-2'>" + key + "</td> <td class='col-md-4'>" + desc + "</td> <td class='col-md-6'>" + value + "</td></tr>");

    } else if ((typeof finalData[key] === 'function') || (typeof finalData[key] === 'object')) {
      $("#table_div").append("<tr><td class='col-md-2'>" + key + "</td> <td class='col-md-4'>" + desc + "</td> <td class='col-md-6'>" + value + "</td></tr>");

    } else {
      $("#table_div").append("<tr><td class='col-md-2'>" + key + "</td> <td class='col-md-4'>" + desc + "</td> <td class='col-md-6'>" + finalData[key] + "</td></tr>");

    }


  }
}

// send fingerprintData to backend server
function sendToServer(data) {
  $.ajax({
    type: "POST",
    url: "https://ashara.cs.helsinki.fi/process_post",
    data: JSON.stringify(data),
    contentType: "application/json",
    success: function(suc) {
      console.log(suc);
    },
    error: function(err) {
      console.log(err);
    }
  });
}

// function call groups
function functionCallFacade() {
  var output = document.getElementById("out");
  output.innerHTML = "<h1 align ='center'> <img src='image/Fingerprint.png'> Fingerprinting…  </h1>  ";
  getHttpHeadersInfoR();
  getWeglRendererAndVendorInfoR();
  getBrowserInfoR();
  //getDeviceLightInfoR();
  //getDeviceOrientationInfoR();
  //getDeviceProximityInfoR();
  //getDeviceMotionInfoR();
  getdeviceBatteryInfoR();
  getMediaDevicesInfoR();
  getBrowserPermissionsInfo('permissions_after_fingerprint');
  getFingerprint2LibraryInfoR();
  getDetectRtcLibraryInfoR();
  audioFingerprintInfoR();
  mimeTypeInfoR();
  connectionTypeInfoR();
  //enabledPluginInfoR();
  mediaRecorderVideoInfoR();
  mediaRecorderAudioInfoR();
  audioContextPropertiesInfoR();
  audioScillatorCompressorInfoR();
  getInstalledFontsUsingJSR();
  //getInstalledFontsUsingFlashR();
  setTimeout(function() {
    cleanDataR();
    printOnScreenR();
    sendToServerR(finalData);
    console.log(finalData);

  }, 5000);

}

function functionCallFacade2() {

  getDeviceLightInfoR();
  getDeviceOrientationInfoR();
  getDeviceProximityInfoR();
  getDeviceMotionInfoR();
  getHttpHeadersInfoR();
  getBrowserPermissionsInfo('permissions_before_fingerprint');
  loadJSON(function(response) {
    // Parse JSON string into object
    actual_JSON = JSON.parse(response);

  });

}


// main Entry Function
function mainEntryFunction() {

  var d = jQuery.Deferred(),
    p = d.promise();
  //You can chain jQuery promises using .then
  p.then(getLocationInfo)
    .then(notificationsPermissionRequest)
    .then(requestMidiAccess)
    .then(mediaDevicesPermissionsRequest)
    .then(function(value) {
      console.log(value);
      functionCallFacadeR();
    });
  d.resolve();

}

$(document).ready(function() {
  console.log("ready!");
  functionCallFacade2R();
});
//console.log(fingerprintData);
$("#btn").on("click", function() {
  document.getElementById("btn").disabled = true;
  mainEntryFunctionR();
});
