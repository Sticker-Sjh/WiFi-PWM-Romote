#include "stm32f10x.h"                  // Device header
#include "Delay.h"
#include "Serial.h"
#include "Servo.h"
#include "string.h"

float Angle;			//定义角度变量

int main(void)
{
	char data[]="on";
	Servo_Init();		//舵机初始化
	Serial_Init();		//串口初始化
	ESP8266_Init();
	
	while (1)
	{
//		niu();
		//订阅主题
		Serial_SendString("cmd=1&uid=66cefa140f36afae8f6470a6463e5350&topic=mao\r\n");
		Delay_s(1);
		SendtoBafa("mao", data);
		Delay_s(1);
		if(usart1_ctrl.ready_flag)
        {
            __disable_irq();  // 临界区保护
            uint8_t local_buf[USART1_REC_NUM];
            memcpy(local_buf, usart1_ctrl.buffer, sizeof(local_buf));
            usart1_ctrl.ready_flag = 0;
            __enable_irq();
            
            // 数据解析（安全操作）
            if(strstr((char*)local_buf, END_MARKER) != NULL)
            {
                niu();  // 业务逻辑处理
            }
            
            // 清空缓冲区
            memset(usart1_ctrl.buffer, 0, sizeof(usart1_ctrl.buffer));
        }
        
        // 超时保护（1秒无数据自动重置）
        if(GetSystemTick() - usart1_ctrl.last_active > 1000)
        {
            usart1_ctrl.index = 0;
            memset(usart1_ctrl.buffer, 0, sizeof(usart1_ctrl.buffer));
        }
		
	}
}
