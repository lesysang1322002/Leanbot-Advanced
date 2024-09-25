#include <Leanbot.h>
#include <Arduino_APDS9960.h>
 
#define   MPU6050_INCLUDE_DMP_MOTIONAPPS20
#include "MPU6050.h"
#include "MPU6050_6Axis_MotionApps_V6_12.h"

MPU6050 mpu;
  
void setup() {
  Leanbot.begin();
  Wire.begin();
  Wire.setClock(400000);        
  MPU6050_begin();
  APDS9960_begin();
  unsigned long startTime = millis();
}
 
 
void loop() {
  MPU6050_Print();
  // APDS9960_Print();
  // MAX4466_Print();
}
 
void  APDS9960_Print(){
  APDS.proximityAvailable();
 
  if (APDS.gestureAvailable()) {
    int gesture = APDS.readGesture();
    switch (gesture) {
      case GESTURE_UP:
        waitUntilNextBLESend();
        Serial.println(F( "APDS9960  gesture DOWN" ));
        break;
 
      case GESTURE_DOWN:
        waitUntilNextBLESend();
        Serial.println(F( "APDS9960  gesture UP" ));
        break;
 
      case GESTURE_LEFT:
        waitUntilNextBLESend();
        Serial.println(F( "APDS9960  gesture RIGHT" ));
        break;
 
      case GESTURE_RIGHT:
        waitUntilNextBLESend();
        Serial.println(F( "APDS9960  gesture LEFT" ));
        break;
 
      default:
        break;
    }
  }
 
  if (APDS.colorAvailable()) {
    int r, g, b, c;
    APDS.readColor(r, g, b, c);
    waitUntilNextBLESend();
 
    Serial.print(F( "APDS9960  RGB " ));
    Serial_printtb(r);
    Serial_printtb(g);
    Serial_printtb(b);
    Serial.println(c);
  }
}
 
void MAX4466_Print() {
  long sum = 0, ssum = 0;
  const int N_SAMPLES = 256;
 
  for (int i = 0; i < N_SAMPLES; i++) {
    analogRead(A4); 
    int soundSample = analogRead(A6) - 512;
    sum  += soundSample;
    ssum += soundSample * soundSample;
  }
 
  long Mean = 512 + sum / N_SAMPLES;
  long Var = (ssum - ((sum * sum) / N_SAMPLES)) / N_SAMPLES;
  
  waitUntilNextBLESend();
  Serial.print(F("MAX4466 Mean: "));
  Serial.print(Mean);
  Serial.print(F(" Variance: "));
  Serial.println(Var);
}
 
void MPU6050_Print(){
  uint8_t fifoBuffer[64];  
  VectorInt16 a, g;
  Quaternion q;  

  if (mpu.dmpGetCurrentFIFOPacket(fifoBuffer)) {
    mpu.dmpGetAccel(&a, fifoBuffer);
    waitUntilNextBLESend();
    Serial.print(F( "MPU6050 Axyz " ));
    Serial_printtb(a.x);
    Serial_printtb(a.y);
    Serial_printtb(a.z);
    mpu.dmpGetGyro(&g, fifoBuffer);
    Serial.print(F( "Gxyz " ));    
    Serial_printtb(g.x);
    Serial_printtb(g.y);
    Serial_printtb(g.z);
    mpu.dmpGetQuaternion(&q, fifoBuffer);
    Serial.print(F( "Qwxyz " ));    
    Serial_printtb(q.w); 
    Serial_printtb(q.x);
    Serial_printtb(q.y);
    Serial.println(q.z);
  }
  else{
    unsigned long endTime = millis(); 
    Serial.print(F("No FiFo data after: "));
    Serial.println(endTime - startTime);
  }
}

void MPU6050_begin(){
    mpu.initialize();
  if ( mpu.testConnection() && mpu.dmpInitialize() == 0) {
    mpu.setDMPEnabled(true);
    waitUntilNextBLESend();
    Serial.println(F( "MPU6050 Init ok." ));
  } else {
    waitUntilNextBLESend();
    Serial.println(F( "MPU6050 Init error." ));
  }
}

void APDS9960_begin(){
  if (APDS.begin()) {
    waitUntilNextBLESend();
    Serial.println(F( "APDS9960 Init ok." ));
  } else {
    waitUntilNextBLESend();
    Serial.println(F( "APDS9960 Init error." ));
  }
}
 
template <typename T>
void Serial_printtb(T a) {
  Serial.print(a);
  Serial.print('\t');
}
 
void waitUntilNextBLESend() {
  static int nextSendTime = 0;
  const int delayMs = 40;
  while ((int)(nextSendTime - millis()) >= 0);
  nextSendTime = millis() + delayMs;
}