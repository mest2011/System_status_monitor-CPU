# System Status Monitor (CPU)

Monitor de status do computador num display LCD 16x2 ligado a um Arduino. Um script Node.js lê o uso de **CPU**, **memória RAM** e o nível da **bateria** do PC e envia pela porta serial (USB) para o Arduino, que mostra tudo no display em tempo real.

```
┌────────────────┐
│CPU:23% Mem:61% │
│Bat:87% charging│
└────────────────┘
```

---

## Como funciona

1. O Arduino inicia, mostra uma mensagem de boas-vindas e passa a enviar um caractere (`" "`) pela serial a cada ciclo do `loop()`.
2. O script Node (`src/arduinoCommunicator.js`) escuta a porta serial. A cada dado recebido, ele coleta as métricas do sistema com a biblioteca `systeminformation`.
3. O script monta uma string de 32 caracteres (16 por linha) e envia de volta ao Arduino.
4. O firmware lê a string e escreve os 16 primeiros caracteres na linha 1 e os 16 seguintes na linha 2 do LCD.

| Campo      | Origem                                   |
| ---------- | ---------------------------------------- |
| `CPU:xx%`  | Carga atual da CPU (`si.currentLoad()`)  |
| `Mem:xx%`  | RAM usada / RAM total (`si.mem()`)       |
| `Bat:xx%`  | Porcentagem da bateria (`si.battery()`)  |
| `charging` | Aparece quando o carregador está ligado  |

---

## Tecnologias

**PC (host)**
- [Node.js](https://nodejs.org/)
- [serialport](https://serialport.io/) `^9.0.7`: comunicação serial com o Arduino
- [systeminformation](https://systeminformation.io/) `^5.6.12`: leitura de CPU, memória e bateria

**Arduino (firmware)**
- Arduino IDE / C++
- `Wire.h`: barramento I2C
- [`LiquidCrystal_I2C`](https://github.com/johnrickman/LiquidCrystal_I2C): controle do LCD via módulo I2C

---

## Hardware

### Lista de materiais

- 1x Arduino (Uno, Nano ou compatível com ATmega328P)
- 1x Display LCD 16x2 com módulo I2C (backpack PCF8574)
- 4x jumpers
- 1x cabo USB para ligar o Arduino ao PC

### Ligação

| Módulo I2C do LCD | Arduino Uno / Nano |
| ----------------- | ------------------ |
| GND               | GND                |
| VCC               | 5V                 |
| SDA               | A4                 |
| SCL               | A5                 |

> Em um Arduino Mega, use SDA = pino 20 e SCL = pino 21. Se o display acender mas não mostrar texto, ajuste o contraste no trimpot azul do módulo I2C.

---

## Setup

### 1. Gravar o firmware no Arduino

1. Instale a [Arduino IDE](https://www.arduino.cc/en/software).
2. Instale a biblioteca **LiquidCrystal I2C** em *Ferramentas → Gerenciar Bibliotecas*.
3. Abra `FirmwareArduino/FirmwareArduino.ino`.
4. Confira o endereço I2C do display na linha:
   ```cpp
   LiquidCrystal_I2C lcd(0x27,20,4);
   ```
   O endereço mais comum é `0x27`; alguns módulos usam `0x3F`. Se não souber, rode um sketch *I2C Scanner* para descobrir. O código escreve só nas duas primeiras linhas, então funciona com displays 16x2 e 20x4.
5. Selecione a placa e a porta em *Ferramentas* e clique em **Carregar**.

Ao ligar, o display deve mostrar `Bem vindo!`.

### 2. Configurar o script no PC

1. Instale o [Node.js](https://nodejs.org/).
2. Clone o repositório e instale as dependências:
   ```bash
   git clone https://github.com/mest2011/System_status_monitor-CPU.git
   cd System_status_monitor-CPU
   npm install
   ```
3. Ajuste a porta serial em `src/arduinoCommunicator.js`:
   ```js
   const port = new SerialPort("COM4", {
     baudRate: 9600,
   });
   ```
   - **Windows:** veja a porta no *Gerenciador de Dispositivos → Portas (COM e LPT)*, ex.: `COM3`.
   - **Linux:** normalmente `/dev/ttyUSB0` ou `/dev/ttyACM0` (seu usuário precisa estar no grupo `dialout`).
   - **macOS:** algo como `/dev/tty.usbserial-XXXX` ou `/dev/tty.usbmodemXXXX`.

   O `baudRate` deve continuar `9600`, igual ao `Serial.begin(9600)` do firmware.

> Feche o Monitor Serial da Arduino IDE antes de rodar o script: só um programa pode usar a porta serial por vez.

---

## Como usar

Com o Arduino conectado via USB:

```bash
npm start
```

Em poucos segundos o display passa a mostrar CPU, memória e bateria, atualizando continuamente. Para parar, use `Ctrl+C`.

### Iniciar junto com o Windows

O arquivo `monitor-arduino-cpu.bat` abre o projeto e roda `npm start`. Para usar:

1. Edite o caminho dentro do `.bat` para a pasta onde você clonou o projeto:
   ```bat
   start /d "C:\caminho\para\System_status_monitor-CPU\" npm start
   ```
2. Pressione `Win + R`, digite `shell:startup` e coloque um atalho do `.bat` nessa pasta.

Assim o monitor inicia automaticamente no logon.

---

## Problemas comuns

| Sintoma | Solução |
| ------- | ------- |
| `Error: Opening COM4: File not found` | A porta configurada está errada ou o Arduino não está conectado. |
| `Access denied` / porta ocupada | Feche o Monitor Serial da Arduino IDE ou outro programa usando a porta. |
| Display aceso, sem texto | Ajuste o contraste no trimpot ou verifique o endereço I2C (`0x27` / `0x3F`). |
| `Bat:` com valor estranho em desktop | Computadores sem bateria não reportam porcentagem; o campo pode ficar vazio ou zerado. |
