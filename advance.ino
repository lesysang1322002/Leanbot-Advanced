#include <Leanbot.h>
#include <Arduino_APDS9960.h>

#include "MPU6050.h"
MPU6050 sensor;

int r, g, b, c;
 
const int delayMs = 20;
 
void setup() {
  Leanbot.begin();
  Wire.begin();        
 
  sensor.initialize();
  if ( sensor.testConnection() ) {
    delay(delayMs);
    Serial.println(F( "Init MPU6050 ok." ));
  } else {
    delay(delayMs);
    Serial.println(F( "Init MPU6050 error." ));
  }
 
  if (APDS.begin()) {
    delay(delayMs);
    Serial.println(F( "Init APDS9960 ok." ));
  } else {
    delay(delayMs);
    Serial.println(F( "Init APDS9960 error." ));
  }
}
 
 
void loop() {
  MAX4466_Print();
  APDS9960_Print();
  MPU6050_Print();
}
 
void  APDS9960_Print(){
  APDS.proximityAvailable();
 
  if (APDS.gestureAvailable()) {
    int gesture = APDS.readGesture();
    switch (gesture) {
      case GESTURE_UP:
        delay(delayMs);
        Serial.println(F( "APDS9960  gesture DOWN" ));
        break;
 
      case GESTURE_DOWN:
        delay(delayMs);
        Serial.println(F( "APDS9960  gesture UP" ));
        break;
 
      case GESTURE_LEFT:
        delay(delayMs);
        Serial.println(F( "APDS9960  gesture RIGHT" ));
        break;
 
      case GESTURE_RIGHT:
        delay(delayMs);
        Serial.println(F( "APDS9960  gesture LEFT" ));
        break;
 
      default:
        break;
    }
  }
 
  if (APDS.colorAvailable()) {
    APDS.readColor(r, g, b, c);
    delay(delayMs);

    Serial.print(F( "APDS9960  RGB " ));
    Serial_printtb(r);
    Serial_printtb(g);
    Serial_printtb(b);
    Serial.println(c);
  }
}



void MAX4466_Print() {
  const int N_SAMPLES = 175;

  long sum  = 0;
  long ssum = N_SAMPLES / 2;

  for (int i = 0; i < N_SAMPLES; i++) {
    long soundSample = analogRead(A6);
    sum  += soundSample;
    ssum += soundSample * soundSample;
  }

  long Mean = sum / N_SAMPLES;
  long Var  = (ssum*N_SAMPLES - sum*sum) / (N_SAMPLES*N_SAMPLES);

  Serial.print(F("MAX4466   Noise "));
  Serial.print(Mean);
  Serial.print(F(" Variance "));
  Serial.println(Var);
}
 
void MPU6050_Print(){
  if(sensor.testConnection()){
    int ax, ay, az;
    int gx, gy, gz;

    sensor.getAcceleration(&ax, &ay, &az);
    sensor.getRotation(&gx, &gy, &gz);
    delay(delayMs);

    Serial.print(F( "MPU6050   Axyz " ));
    Serial_printtb(ax);
    Serial_printtb(ay);
    Serial_printtb(az);
    Serial.print("Gxyz ");
    Serial_printtb(gx);
    Serial_printtb(gy);
    Serial.println(gz);
  }
}

void Serial_printtb(int a) {
  Serial.print(a);
  Serial.print('\t');
}