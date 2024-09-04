var bleService = '0000ffe0-0000-1000-8000-00805f9b34fb';
var bleCharacteristic = '0000ffe1-0000-1000-8000-00805f9b34fb';
var gattCharacteristic;
var bluetoothDeviceDetected;

let Text_Area = document.getElementById("textareaNotification");
let Text_RGBLeds = document.getElementById("textAreaRGB");
let Text_Steppers = document.getElementById("textAreaStepper");

function isWebBluetoothEnabled() {
    if (!navigator.bluetooth) {
    console.log('Web Bluetooth API is not available in this browser!');
    // log('Web Bluetooth API is not available in this browser!');
    return false
    }
    return true
}
function requestBluetoothDevice() {
    if(isWebBluetoothEnabled){
logstatus('Finding...');
navigator.bluetooth.requestDevice({
    filters: [{
        services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] }] 
    })         
.then(device => {
    device.addEventListener('gattserverdisconnected', onDisconnected);
    dev=device;
    logstatus("Connect to " + dev.name);
    console.log('Connecting to', dev);
    return device.gatt.connect();
})
.then(server => {
        console.log('Getting GATT Service...');
        logstatus('Getting Service...');
        return server.getPrimaryService(bleService);
    })
    .then(service => {
        console.log('Getting GATT Characteristic...');
        logstatus('Geting Characteristic...');
        return service.getCharacteristic(bleCharacteristic);
    })
    .then(characteristic => {
        logstatus(dev.name + " - Advance Modules");
        checkMessageWithin5Seconds();
        document.getElementById("buttonText").innerText = "Rescan";
        checkconnected = true;
        gattCharacteristic = characteristic
        gattCharacteristic.addEventListener('characteristicvaluechanged', handleChangedValue);   
        return gattCharacteristic.startNotifications();
})
.catch(error => {
    if (error instanceof DOMException && error.name === 'NotFoundError' && error.message === 'User cancelled the requestDevice() chooser.') {
        console.log("User has canceled the device connection request.");
        logstatus("SCAN to connect");
    } else {
        console.log("Unable to connect to device: " + error);
        logstatus("ERROR");
    }
    });
}}

function disconnect()
{
    logstatus("SCAN to connect");
    console.log("Disconnected from: " + dev.name);
    return dev.gatt.disconnect();
}

function onDisconnected(event) {
    const device = event.target;
    logstatus("SCAN to connect");
    ResetVariables();
    document.getElementById("buttonText").innerText = "Scan";
    console.log(`Device ${device.name} is disconnected.`);
}

function send(data){
    console.log("You -> " + data + "\n");
    gattCharacteristic.writeValue(str2ab(data+"\n"));
}

function str2ab(str){
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, l = str.length; i < l; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function  logstatus(text){
    const navbarTitle = document.getElementById('navbarTitle');
    navbarTitle.textContent = text;
}

let checkconnected = false;

const button = document.getElementById("toggleButton");

function toggleFunction() {
    if (button.innerText == "Scan") {
        requestBluetoothDevice();
    } else {
        disconnect();
        requestBluetoothDevice();
        Rescan();
    }
}

function Rescan(){
    ResetVariables();
}

function ResetVariables(){
    checkconnected = false;
    clearTimeout(timeoutId);
    checkFirstValue = true;
    checkmessageMPU6050 = false;
    checkmessageAPDS9960 = false;
    clearTimeout(timeoutCheckMessage);
    textAreaAPDS.value = "";
    textAreaMPU.value = "";
    textAreaMAX.value = "";
    TextAreaGesture.value = "";
    TextAreaMean.value = "";
    TextAreaVariance.value = "";
    TextAreaMinVariance.value = "";
    TextAreaMaxVariance.value = "";
    TextAreaMinMean.value = "";
    TextAreaMaxMean.value = "";
    R.textContent = "";
    G.textContent = "";
    B.textContent = "";
    C.textContent = "";
    Ax.textContent = "";
    Ay.textContent = "";
    Az.textContent = "";
    Gx.textContent = "";
    Gy.textContent = "";
    Gz.textContent = "";
}

let string = "";
let textAreaAPDS = document.getElementById("textAreaAPDS");
let textAreaMPU = document.getElementById("textAreaMPU");
let textAreaMAX = document.getElementById("textAreaMAX");
let TextAreaGesture = document.getElementById("textAreaGesture");
let TextAreaMean = document.getElementById("textAreaMean");
let TextAreaVariance = document.getElementById("textAreaVariance");
let TextAreaMinVariance = document.getElementById("textAreaMinVariance");
let TextAreaMaxVariance = document.getElementById("textAreaMaxVariance");
let TextAreaMinMean = document.getElementById("textAreaMinMean");
let TextAreaMaxMean = document.getElementById("textAreaMaxMean");
let R = document.getElementById("R");
let G = document.getElementById("G");
let B = document.getElementById("B");
let C = document.getElementById("C");
let Ax = document.getElementById("Ax");
let Ay = document.getElementById("Ay");
let Az = document.getElementById("Az");
let Gx = document.getElementById("Gx");
let Gy = document.getElementById("Gy");
let Gz = document.getElementById("Gz");

let stringcheck = "";
let timeoutId;

let arrMean = [10];
let arrVariance = [10];

let checkFirstValue = true;
let minMean, maxMean, minVariance, maxVariance;
let timeoutCheckMessage;
let checkmessageMPU6050 = false;
let checkmessageAPDS9960 = false;

function handleChangedValue(event) {
    let data = event.target.value;
    let dataArray = new Uint8Array(data.buffer);
    let textDecoder = new TextDecoder('utf-8');
    let valueString = textDecoder.decode(dataArray);
    let n = valueString.length;
    if(valueString[n-1] === '\n'){
        string += valueString;
        console.log(string);
        let arrString = string.split(/[ \t\r\n]+/);
        let stringResult = string.substring(string.indexOf(' ') + 1, string.length-1);
        if(arrString[0] === 'Init' && arrString[1] === 'MPU6050'){
            checkmessageMPU6050 = true;
        }
        if(arrString[0] === 'Init' && arrString[1] === 'APDS9960'){
            checkmessageAPDS9960 = true;
        }
        if(checkmessageMPU6050 && checkmessageAPDS9960){
            clearTimeout(timeoutCheckMessage);
        }
        if(arrString[0] === 'MAX4466'){
            let arr2Int = parseInt(arrString[2]);
            let arr4Int = parseInt(arrString[4]);
            if(checkFirstValue){
                minMean = arr2Int;
                maxMean = arr2Int;
                minVariance = arr4Int;
                maxVariance = arr4Int;
                checkFirstValue = false;
            }
            if(arr2Int < minMean){
                minMean = arr2Int
            }
            if(arr2Int > maxMean){
                maxMean = arr2Int;
            }
            if(arr4Int < minVariance){
                minVariance = arr4Int;
            }
            if(arr4Int > maxVariance){
                maxVariance = arr4Int;
            }
            TextAreaMinMean.value = minMean;
            TextAreaMaxMean.value = maxMean;
            TextAreaMinVariance.value = minVariance;
            TextAreaMaxVariance.value = maxVariance;
            // console.log("Result:" + (maxVariance-minVariance));
            // console.log("MinMena " + minMean + " MaxMean "+ maxMean + " MinVar " + minVariance + " MaxVar " + maxVariance);
            textAreaMAX.value = stringResult;
            // console.log(stringResult);
            // arrMean.push(arrString[2]);
            TextAreaMean.value = arrString[2];
            // arrVariance.push(arrString[4]);
            TextAreaVariance.value = arrString[4];
        }

        if(arrString[0] === 'MPU6050'){
            textAreaMPU.value = stringResult;
            Ax.textContent = arrString[2];
            Ay.textContent = arrString[3];
            Az.textContent = arrString[4];
            Gx.textContent = arrString[6];
            Gy.textContent = arrString[7];
            Gz.textContent = arrString[8];
        }
        if(arrString[0] === 'APDS9960'){
            if(arrString[1] === 'gesture'){
                TextAreaGesture.value = arrString[2];
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    TextAreaGesture.value = '';
                }, 10000);
            }
            else{
            textAreaAPDS.value = stringResult;
            R.textContent = arrString[2];
            G.textContent = arrString[3];
            B.textContent = arrString[4];
            C.textContent = arrString[5];
            }
        }
        string = "";
    }
    else{
        string += valueString;     
    }
}

function handleAction(action) {
    if (checkconnected) {
        send(action);
    }
}

function checkMessageWithin5Seconds() {
    // Thiết lập hàm setTimeout để kết thúc sau 5 giây
        timeoutCheckMessage = setTimeout(function() {
        console.log("5 seconds timeout, message incorrect.");
        let infoBox = document.getElementById("infopopup");
        // Hiển thị info box
        infoBox.style.display = "block";
        document.addEventListener("click", function(event) {
            if (!infoBox.contains(event.target)) {
                infoBox.style.display = "none";
            }
        });
    }, 5000);
}

document.addEventListener('DOMContentLoaded', function () {
    var infoButton = document.getElementById('infoButton');
    var infoContent = document.getElementById('infoContent');
  
    infoButton.addEventListener('click', function (event) {
        event.stopPropagation(); // Ngăn chặn sự kiện click lan sang các phần tử cha
        if (infoContent.style.display === 'block') {
            infoContent.style.display = 'none';
        } else {
            infoContent.style.display = 'block';
        }
    });
  
    document.addEventListener('click', function () {
        infoContent.style.display = 'none';
    });
});

function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.content');
    
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    contents.forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.add('active');
    document.getElementById('tab' + tabId.slice(-1)).classList.add('active');
}

var tabs = document.querySelectorAll('.tab');

// Add event listener to each tab
tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs
        tabs.forEach(function(tab) {
            tab.classList.remove('active');
        });

        // Add active class to clicked tab
        this.classList.add('active');
    });
});
