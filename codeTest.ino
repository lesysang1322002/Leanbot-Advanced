#include <Leanbot.h>
#include <Arduino_APDS9960.h>
 
#define   MPU6050_INCLUDE_DMP_MOTIONAPPS20
#include "MPU6050.h"
#include "MPU6050_6Axis_MotionApps20.h"

MPU6050 mpu;
  
void setup() {
  Leanbot.begin();
  Wire.begin();
  Wire.setClock(400000);        
  
  mpu.initialize();
  if ( mpu.testConnection() && mpu.dmpInitialize() == 0) {
    mpu.setDMPEnabled(true);
    waitUntilNextBLESend();
    Serial.println(F( "MPU6050 Init ok." ));
  } else {
    waitUntilNextBLESend();
    Serial.println(F( "MPU6050 Init error." ));
  }
 
  if (APDS.begin()) {
    waitUntilNextBLESend();
    Serial.println(F( "APDS9960 Init ok." ));
  } else {
    waitUntilNextBLESend();
    Serial.println(F( "APDS9960 Init error." ));
  }
}
 
 
void loop() {
  waitUntilNextBLESend();
  MPU6050_Print();
  APDS9960_Print();
  MAX4466_Print();
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
 
  Serial.print(F("MAX4466 Mean: "));
  Serial.print(Mean);
  Serial.print(F(" Variance: "));
  Serial.println(Var);
}
 
void MPU6050_Print(){
  if(mpu.testConnection()){
    int ax, ay, az;
    int gx, gy, gz;
 
    mpu.getAcceleration(&ax, &ay, &az);
    mpu.getRotation(&gx, &gy, &gz);
    waitUntilNextBLESend();
 
    Serial.print(F( "MPU6050   Axyz " ));
    Serial_printtb(ax);
    Serial_printtb(ay);
    Serial_printtb(az);
    Serial.print("Gxyz ");
    Serial_printtb(gx);
    Serial_printtb(gy);
    Serial.printtb(gz);
  }

  uint8_t fifoBuffer[64];  
  Quaternion q;             

  if (mpu.dmpGetCurrentFIFOPacket(fifoBuffer)) {
    mpu.dmpGetQuaternion(&q, fifoBuffer);
    Serial.print("Quaternion ");
    Serial.print(q.w); Serial.print("\t");
    Serial.print(q.x); Serial.print("\t");
    Serial.print(q.y); Serial.print("\t");
    Serial.println(q.z);
    delay(50);
  }
}
 
void Serial_printtb(int a) {
  Serial.print(a);
  Serial.print('\t');
}
 
void waitUntilNextBLESend() {
  static int nextSendTime = 0;
  const int delayMs = 40;
  while ((int)(nextSendTime - millis()) >= 0);
  nextSendTime = millis() + delayMs;
}
