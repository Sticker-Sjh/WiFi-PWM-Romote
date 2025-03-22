#ifndef __SERIAL_H
#define __SERIAL_H

#include <stdio.h>

extern char Serial_RxPacket[];
extern uint8_t Serial_RxFlag;
// 硬件相关配置
#define USART1_REC_NUM        128     // 缓冲区扩容防止溢出
#define END_MARKER           "open"   // 结束标识符

// 接收控制结构体
typedef struct {
    uint8_t buffer[USART1_REC_NUM];
    volatile uint16_t index;
    volatile uint8_t ready_flag;
    uint32_t last_active;
} UART_Control;
void niu(void);
extern UART_Control usart1_ctrl;
void SysTick_Handler(void);
void SystemTick_Init(void);
uint32_t GetSystemTick(void);
void Serial_Init(void);
void Serial_SendByte(uint8_t Byte);
void Serial_SendArray(uint8_t *Array, uint16_t Length);
void Serial_SendString(char *String);
void Serial_SendNumber(uint32_t Number, uint8_t Length);
void Serial_Printf(char *format, ...);
void USART1_IRQHandler(void);
void ESP8266_Init(void);
void SendtoBafa(char* topic, char* msg);

#endif
