var scannerConnector = function () {
    var connection;
    var ip, port;
    var openL, closeL, messageL, errorL, imageL = null;
    var _heart_beat = "heart-beat";
    var _last_heart_beat_time = -1;
    var _time_out = 3500;
    var _interval_out_id = -1;
    var receiveHeartBeat = function () {
        _last_heart_beat_time = new Date().getTime();
    };
    var _init_heartBeat = function () {
        _last_heart_beat_time = new Date().getTime();
        _interval_out_id = setInterval(function () {
            if (new Date().getTime() - _last_heart_beat_time >= _time_out){
                scannerConnector && scannerConnector.disconnect();
                _destroy_connect();
                closeL && closeL();
                console.log("连接超时");
            }
        }, 1000);
    };
    var _destroy_connect = function () {
        if (_interval_out_id !== -1){
            clearInterval(_interval_out_id);
            _interval_out_id = -1;
        }
    };

    var _connect_timeout = 4000;
    var _connect_timeout_id = -1;
    var _wait_connect = function () {
      if (_connect_timeout_id != -1){
          clearTimeout(_connect_timeout_id);
      }
      _connect_timeout_id = setTimeout(function () {
          if (!scannerConnector.isConnected()){
              scannerConnector.disconnect();
          }
      }, _connect_timeout);
    };
    return {
        connect: function (_ip) {
            if (connection) {
                if (connection.readyState !== WebSocket.CLOSED) {
                    connection.close();
                }
            }
            connection = new WebSocket('ws://' + _ip + ':' + 8000);
            connection.onopen = function () {
                _init_heartBeat();
                openL && openL();
                //openL;
            };
            connection.onclose = function () {
                _destroy_connect();
                closeL && closeL();
                //closeL;
            };
            connection.onmessage = function (data) {
                //心跳
                if (data.data == _heart_beat) {
                    receiveHeartBeat();
                    return;
                }else if (data.data == "pause"){
                    _time_out = 7000;
                    return;
                }else if (data.data == "resume"){
                    _time_out = 3500;
                    return;
                } else if (data.data.length > 20){
                    imageL && imageL(data.data);
                    return;
                }
                messageL && messageL(data);
            };
            connection.onerror = function () {
                _destroy_connect();
                errorL && errorL();
            };
            ip = _ip;
            port = 8000;
            _wait_connect();
        },
        disconnect: function () {
            connection.close();
        },
        setOpenListener: function (cb) {
            openL = cb;
        },
        setCloseListener: function (cb) {
            closeL = cb;
        },
        setMessageListener: function (cb) {
            messageL = cb;
        },
        setImageListener: function(cb) {
            imageL = cb;
        },
        setErrorListener: function (cb) {
            errorL = cb;
        },
        isConnected: function () {
            if (!connection) {
                return false;
            }
            return connection.readyState === WebSocket.OPEN;
        },
        getAddress: function () {
            return ip + ':' + port;
        },
        setConnectTimeOut: function (time) {
            _time_out = time;
        }
    }
}();