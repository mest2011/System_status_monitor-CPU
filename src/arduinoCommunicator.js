const SerialPort = require("serialport");
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort("COM4", {
  baudRate: 9600,
});
const parser = new Readline();
const si = require("systeminformation");

port.pipe(parser);
parser.on("data", console.log);
function write() {
  port.on("data", async function (data) {
    let cpuUsage = parseInt(
      await si.currentLoad().then((data) => {
        return data.currentLoad;
      })
    );
    let memUsage = await si.mem().then((data) => {
      return parseInt((data.used * 100) / data.total);
    });
    let bateryPercent = await si.battery().then((data) => {
      return data;
    });

    if (cpuUsage) {
      port.write(
        `CPU:${
          cpuUsage < 10 ? "0" + cpuUsage : cpuUsage
        }% Mem:${memUsage} %Bat:${
          bateryPercent.percent < 10
            ? "0" + bateryPercent.percent
            : bateryPercent.percent
        }% ${bateryPercent.acConnected ? "charging": "        "} `
      );
    }
  });
}

port.on("open", function () {
  write();
});
