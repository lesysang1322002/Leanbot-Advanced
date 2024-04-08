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
        // checkMessageWithin5Seconds();
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
    checkconnected = false;
    // checkmessage = false;
}

let string = "";
let textAreaAPDS = document.getElementById("textAreaAPDS");
let textAreaMPU = document.getElementById("textAreaMPU");
let textAreaMAX = document.getElementById("textAreaMAX");
let stringcheck = "";


function handleChangedValue(event) {
    let data = event.target.value;
    let dataArray = new Uint8Array(data.buffer);
    let textDecoder = new TextDecoder('utf-8');
    let valueString = textDecoder.decode(dataArray);
    let n = valueString.length;
    if(valueString[n-1] === '\n'){
        string += valueString;
        console.log(string);
        let whitespaceindex = string.indexOf(' ');
        let stringCheck = string.substring(0, whitespaceindex);
        let stringResult = string.substring(whitespaceindex + 1, string.length-1);
        if(stringCheck === 'MAX4466'){
            textAreaMAX.value = stringResult;
        }
        if(stringCheck === 'MPU6050'){
            textAreaMPU.value = stringResult;
        }
        if(stringCheck === 'APDS9960'){
            textAreaAPDS.value = stringResult;
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
