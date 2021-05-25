const SerialPort = require("serialport");
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort("COM4", {
  baudRate: 9600,
});
const parser = new Readline();
const si = require("systeminformation");

port.pipe(parser);
parser.on("data", console.log);

const getCPUData = async () => {
  try {
    return await parseInt(
      await si.currentLoad().then((data) => {
        return data.currentLoad;
      })
    );
  } catch (error) {
    return Promise.reject("Oops!").catch((err) => {
      throw new Error(err);
    });
  }
};

const getMemoryData = async () => {
  try {
    return await si.mem().then((data) => {
      return parseInt((data.used * 100) / data.total);
    });
  } catch (error) {
    return Promise.reject("Oops!").catch((err) => {
      throw new Error(err);
    });
  }
};

const getBateryData = async () => {
  try {
    return await si.battery().then((data) => {
      return data;
    });
  } catch (error) {
    return Promise.reject("Oops!").catch((err) => {
      throw new Error(err);
    });
  }
};

const stringFactory = () => {
  port.on("data", async (data) => {
    let cpuUsage = await getCPUData();
    let memUsage = await getMemoryData();
    let bateryPercent = await getBateryData();

    let str =
      `CPU:${cpuUsage < 10 ? "0" + cpuUsage : cpuUsage}% ` +
      `Mem:${memUsage}% ` +
      `Bat:${
        bateryPercent.percent < 10
          ? "0" + bateryPercent.percent
          : bateryPercent.percent
      }% ` +
      `${bateryPercent.acConnected ? "charging" : "        "} `;

    if (cpuUsage) {
      port.write(str);
    }
  });
};

port.on("open", () => {
  stringFactory();
});
