function logstatusWebName(text){
    logstatus(text + " - Advance Modules");
}

function resetVariable() {
    clearTimeout(timeoutCheckMessage);
    checkFirstValue = true;
    MPU6050_checkmessage = false;
    checkmessageAPDS9960 = false;

    document.querySelectorAll("textarea").forEach(el => el.value = ""); // Xóa nội dung của tất cả textarea
    
    counts = { UP: 0, LEFT: 0, RIGHT: 0, DOWN: 0 };
    smoothVolume = 0;
    RGBmax = 0;
    Cmax = 0;

    UI('preview-textfield').textContent = 0;
    gauge.set(0);
    UI('DCMotor_TextArea_PowerLevel').textContent = 0;
    UI('DCMotor_Slider').value = 0;
    UI('DCMotor_Direction').textContent = "Forward";

    UI('btnUp').style.backgroundColor = 'transparent';
    UI('btnLeft').style.backgroundColor = 'transparent';
    UI('btnRight').style.backgroundColor = 'transparent';
    UI('btnDown').style.backgroundColor = 'transparent';

    UI('btnUp').querySelector('h5').innerHTML = "UP<br>0";
    UI('btnLeft').querySelector('h5').innerHTML = "LEFT<br>0";
    UI('btnRight').querySelector('h5').innerHTML = "RIGHT<br>0";
    UI('btnDown').querySelector('h5').innerHTML = "DOWN<br>0";

    UI('APDS9960_Square_C').style.backgroundColor = 'white';
    UI('APDS9960_Square_RGB').style.backgroundColor = 'white';
}

function handleSerialLine(line) {
    console.log("Nano > " + line);
    const arrString = line.split(/[ \t]+/);

    if (MPU6050_checkmessage && checkmessageAPDS9960) clearTimeout(timeoutCheckMessage);
    
    switch (arrString[0]) {
        case 'MAX4466' : return MAX4466_handleInit(arrString);
        case 'MPU6050' : return MPU6050_handleInit(arrString);
        case 'APDS9960': return APDS9960_handleInit(arrString);
        case 'VL53L0x' : return VL53L0X_handleInit(arrString);
        default        : return;
    }
}

//*******APDS9960*******/
let checkmessageAPDS9960 = false;
let RGBmax = 0, Cmax = 0;

let counts = {
    UP: 0,
    LEFT: 0,
    RIGHT: 0,
    DOWN: 0
};

function APDS9960_handleInit(arrString) {
    checkmessageAPDS9960 = true;
    UI('APDS9960_TextArea').value = arrString.slice(1, arrString.length).join(" ");

    if(arrString[2] === "error" || arrString[2] === "ok") return;

    APDS9960_handleRGBC(arrString);
    APDS9960_handleProximity(arrString);
    APDS9960_handleGesture(arrString);
}

function APDS9960_handleRGBC(arrString) {
    const idx = arrString.indexOf('RGBC');
    if (idx === -1) return;
    UI('APDS9960_TextArea_R').value = arrString[idx + 1];
    UI('APDS9960_TextArea_G').value = arrString[idx + 2];
    UI('APDS9960_TextArea_B').value = arrString[idx + 3];
    UI('APDS9960_TextArea_C').value = arrString[idx + 4];

    const rValue = parseInt(arrString[idx + 1]);
    const gValue = parseInt(arrString[idx + 2]);
    const bValue = parseInt(arrString[idx + 3]);
    const cValue = parseInt(arrString[idx + 4]);

    RGBmax = Math.max(RGBmax, rValue, gValue, bValue);
    Cmax = Math.max(Cmax, cValue);

    const cDisplay = mapValue(cValue, 0, Cmax, 0, 255);
    const rDisplay = mapValue(rValue, 0, RGBmax, 0, 255);
    const gDisplay = mapValue(gValue, 0, RGBmax, 0, 255);
    const bDisplay = mapValue(bValue, 0, RGBmax, 0, 255);

    APDS9960_Square_C.style.backgroundColor = `rgb(${cDisplay}, ${cDisplay}, ${cDisplay})`;
    APDS9960_Square_RGB.style.backgroundColor = `rgb(${rDisplay}, ${gDisplay}, ${bDisplay})`;
}

function APDS9960_handleProximity(arrString) {
    const idx = arrString.indexOf('Prox');
    if (idx === -1) return;
    UI('APDS9960_progressProx').value = arrString[idx + 1];
    UI('APDS9960_TextArea_proximity').value = arrString[idx + 1];
}

function APDS9960_handleGesture(arrString) {
    const idx = arrString.indexOf('gesture');
    if (idx === -1) return;

    const gesture = arrString[idx + 1];
    switch (gesture) {
        case 'UP'   : return APDS9960_GestureTransition(btnUp, gesture); 
        case 'LEFT' : return APDS9960_GestureTransition(btnLeft, gesture); 
        case 'RIGHT': return APDS9960_GestureTransition(btnRight, gesture); 
        case 'DOWN' : return APDS9960_GestureTransition(btnDown, gesture); 
        default     : return;
    }
}

function APDS9960_GestureTransition(button, label) {
    button.style.transition = 'none';
    button.style.backgroundColor = 'red';
    counts[label]++; 

    const paragraph = button.querySelector('h5');
    if (paragraph) {
        paragraph.innerHTML = label + "<br>" + counts[label];
    }

    setTimeout(() => {
        button.style.transition = 'background-color 5s ease';
        button.style.backgroundColor = 'transparent';
    }, 1000);
}

//*******MAX4466*******/

var opts = {
    colorStart: "#6fadcf",
    colorStop: void 0,
    gradientType: 0,
    strokeColor: "#e0e0e0",
    generateGradient: true,
    percentColors: [[0.0, "#a9d70b"], [0.50, "#f9c802"], [1.0, "#ff0000"]],
    pointer: {
      length: 0.58,
      strokeWidth: 0.035,
      iconScale: 1.0
    },
    staticLabels: {
      font: "10px sans-serif",
      labels: [10, 20, 30],
      fractionDigits: 0
    },
    staticZones: [
        { strokeStyle: "#FFA500", min: 0, max: 20 },  // Cam (Orange)
        { strokeStyle: "#FFFF00", min: 20, max: 30 }, // Vàng (Yellow)
        { strokeStyle: "#30B32D", min: 30, max: 40 }  // Xanh Lá (Green)
    ],      
    angle: 0.033,
    lineWidth: 0.30,
    radiusScale: 1.0,
    fontSize: 40,
    highDpiSupport: true
};

// Khởi tạo gauge
var target = document.getElementById('demo'); 
var gauge = new Gauge(target).setOptions(opts);

// Gán trường văn bản hiển thị giá trị
document.getElementById("preview-textfield").className = "preview-textfield";
// gauge.setTextField(document.getElementById("preview-textfield"));

// Thiết lập giá trị của gauge
gauge.maxValue = 40;
gauge.setMinValue(0);
gauge.set(0);

// Thiết lập tốc độ chuyển động
gauge.animationSpeed = 32;

let checkFirstValue = true;
let minMean, maxMean, minVariance, maxVariance;
let volume;
let minVolume;
let smoothVolume = 0;

function MAX4466_handleInit(arrString) {
    UI('MAX4466_TextArea').value = arrString.slice(1, arrString.length).join(" ");

    let MeanInt = MAX4466_handleMean(arrString);
    let VarianceInt = MAX4466_handleVariance(arrString);

    if(checkFirstValue){
        minMean = MeanInt;
        maxMean = MeanInt;
        minVariance = VarianceInt;
        maxVariance = VarianceInt;
        checkFirstValue = false;
        minVolume = 10 * Math.log10(VarianceInt);
    }

    minMean = Math.min(minMean, MeanInt);
    maxMean = Math.max(maxMean, MeanInt);
    minVariance = Math.min(minVariance, VarianceInt);
    maxVariance = Math.max(maxVariance, VarianceInt);

    UI('MAX4466_TextArea_MinMean').value = minMean;
    UI('MAX4466_TextArea_MaxMean').value = maxMean;
    UI('MAX4466_TextArea_MinVariance').value = minVariance;
    UI('MAX4466_TextArea_MaxVariance').value = maxVariance;

    if(VarianceInt === 0) {
        if(!checkFirstValue) UI('MAX4466_TextArea').value = "Not plugged in";
        UI('MAX4466_TextArea_Mean').value = "";
        UI('MAX4466_TextArea_MinMean').value = "";
        UI('MAX4466_TextArea_MaxMean').value = "";
        checkFirstValue = true;
        // Cập nhật màu cung tròn thành xám
        gauge.options.staticZones = [
            { strokeStyle: "#808080", min: 0, max: gauge.maxValue } // Cả cung tròn có màu xám
        ];
    }
    else{
        gauge.options.staticZones = [
            { strokeStyle: "#FFA500", min: 0, max: 20 },  // Cam (Orange)
            { strokeStyle: "#FFFF00", min: 20, max: 30 }, // Vàng (Yellow)
            { strokeStyle: "#30B32D", min: 30, max: 40 }  // Xanh Lá (Green)
        ];
    }

    if (VarianceInt > 0) volume = 10 * Math.log10(VarianceInt);
    else volume = 0;

    smoothVolume += (volume - smoothVolume) / 8;
    minVolume = Math.min(minVolume, smoothVolume);
  
    // Hiển thị giá trị đã làm tròn trên giao diện
    UI("preview-textfield").textContent = smoothVolume.toFixed(1);
    // Cập nhật gauge với giá trị không làm tròn để mượt mà hơn
    gauge.set(smoothVolume);            
}

function MAX4466_handleMean(arrString) {
    const idx = arrString.indexOf('Mean');
    if (idx === -1) return;
    UI('MAX4466_TextArea_Mean').value = arrString[idx + 1];
    return parseInt(arrString[idx + 1]);
}

function MAX4466_handleVariance(arrString) {
    const idx = arrString.indexOf('Variance');
    if (idx === -1) return;
    UI('MAX4466_TextArea_Variance').value = arrString[idx + 1];
    return parseInt(arrString[idx + 1]);
}

//*******MPU6050*******/
let MPU6050_checkmessage = false;

function MPU6050_handleInit(arrString) {
    MPU6050_checkmessage = true;
    UI('MPU6050_TextArea').value = arrString.slice(1, arrString.length).join(" ");
    if(arrString[2] === "error" || arrString[2] === "ok") return;

    MPU6050_handleAxyz(arrString);
    MPU6050_handleGxyz(arrString);
    MPU6050_handleQwxyz(arrString);
    MPU6050_handleTempIC(arrString);
}

function MPU6050_handleAxyz(arrString) {
    const idx = arrString.indexOf('Axyz');
    if (idx === -1) return;
    UI('MPU6050_TextArea_Ax').value = arrString[idx + 1];
    UI('MPU6050_TextArea_Ay').value = arrString[idx + 2];
    UI('MPU6050_TextArea_Az').value = arrString[idx + 3];
}

function MPU6050_handleGxyz(arrString) {
    const idx = arrString.indexOf('Gxyz');
    if (idx === -1) return;
    UI('MPU6050_TextArea_Gx').value = arrString[idx + 1];
    UI('MPU6050_TextArea_Gy').value = arrString[idx + 2];
    UI('MPU6050_TextArea_Gz').value = arrString[idx + 3];
}

function MPU6050_handleQwxyz(arrString) {
    const idx = arrString.indexOf( 'Qwxyz' );
    if ( idx === -1 )  return;
  
    const Qw = updateUI( 'Qw' , idx + 1 );  
    const Qx = updateUI( 'Qx' , idx + 2 );  
    const Qy = updateUI( 'Qy' , idx + 3 );  
    const Qz = updateUI( 'Qz' , idx + 4 );  
  
    const quaternion = new THREE.Quaternion( -Qx, +Qz, +Qy, +Qw );
    cube.quaternion.copy(quaternion);
    renderer.render(scene, camera);
  
    function updateUI( ui, idx ) {
      const scaleFactor = 16384.0;
      const xValue = parseFloat(arrString[idx]) / scaleFactor;
      UI('MPU6050_TextArea_' + ui).value = xValue.toFixed(2);
      return xValue;
    }
}

function MPU6050_handleTempIC(arrString) {
    const idx = arrString.indexOf('Temp');
    if (idx === -1) return;
    UI('MPU6050_TextArea_TemIC').value = arrString[idx + 1] + "°C";
}

//*******VL53L0X*******/

function VL53L0X_handleInit(arrString) {
    UI('VL53L0x_TextArea').value = arrString.slice(1, arrString.length).join(" ");
    if(arrString[2] === "error" || arrString[2] === "ok") return;

    if(arrString[1] === 'not') { //
        UI('VL53L0x_TextArea').value = arrString.join(" ");
        // Xóa nội dung trước đó (trường hợp cắm module rồi tháo ra)
        UI('VL53L0x_ProgressDistance').value = 0;
        UI('VL53L0x_TextArea_Distance').value = "";
        return;
    }

    if ( parseInt(arrString[1]) <= 2000) { // Nếu khoảng cách nhỏ hơn 2m
        UI('VL53L0x_ProgressDistance').value = arrString[1]; // Thanh progress đang để max = 2000
        UI('VL53L0x_TextArea_Distance').value = arrString[1] + " mm"; // Hiển thị khoảng cách
        return;
    }
    // Nếu khoảng cách lớn hơn 2m
    UI('VL53L0x_TextArea').value = "No objects detected";
    UI('VL53L0x_ProgressDistance').value = 0;
    UI('VL53L0x_TextArea_Distance').value = "";
}


//*******DCMotor*******/

function DCMotor_updateSliderValue(value) { // Khi điều chỉnh thanh trượt
    if (!gattCharacteristic) return;       // Nếu chưa kết nối BLE thì thoát
    UI("DCMotor_Slider").value = value;
    
    const adjustedValue = UI("DCMotor_Switch").checked ? value : -value;
    handleAction("DCMotor " + adjustedValue);
    UI("DCMotor_TextArea_PowerLevel").textContent = adjustedValue;
}

function DCMotor_handleSwitchChange() { // Khi click vào switch
    DCMotor_updateSliderValue(UI("DCMotor_Slider").value);
}
/**************/

function mapValue(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function handleAction(action) {
    if (gattCharacteristic) {
        send(action);
    }
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

let scene, camera, renderer, cube;

function parentWidth(elem) {
  return elem.parentElement.clientWidth;
}

function parentHeight(elem) {
  return elem.parentElement.clientHeight;
}

function init3D(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(75, parentWidth(document.getElementById("3Dcube")) / parentHeight(document.getElementById("3Dcube")), 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(parentWidth(document.getElementById("3Dcube")), parentHeight(document.getElementById("3Dcube")));

  document.getElementById('3Dcube').appendChild(renderer.domElement);

  // Tạo hình khối (geometry) và vật liệu
  const geometry = new THREE.BoxGeometry(12/4, 7/4, 18/4);

  var cubeMaterials = [
    new THREE.MeshBasicMaterial({color: 0xff0000}),  // Đỏ
    new THREE.MeshBasicMaterial({color: 0x00ff00}),  // Xanh lá cây
    new THREE.MeshBasicMaterial({color: 0x0000ff}),  // Xanh dương
    new THREE.MeshBasicMaterial({color: 0xffff00}),  // Vàng
    new THREE.MeshBasicMaterial({color: 0xff00ff}),  // Tím
    new THREE.MeshBasicMaterial({color: 0x00ffff})   // Xanh dương nhạt (cyan)
  ];

  const material = new THREE.MeshFaceMaterial(cubeMaterials);

  // Tạo đối tượng cube và thêm vào scene
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  camera.position.set(4, 3, -4); 
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

// Hàm thay đổi kích thước đối tượng 3D khi cửa sổ thay đổi kích thước
function onWindowResize(){
  camera.aspect = parentWidth(document.getElementById("3Dcube")) / parentHeight(document.getElementById("3Dcube"));
  camera.updateProjectionMatrix();
  renderer.setSize(parentWidth(document.getElementById("3Dcube")), parentHeight(document.getElementById("3Dcube")));
}

window.addEventListener('resize', onWindowResize, false);

// Khởi tạo mô hình 3D
init3D();