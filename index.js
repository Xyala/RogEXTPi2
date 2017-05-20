var i2c = require('i2c-bus'),
    i2c1;

/* Device address */
var  ROGEXT_ADDR = 0x4a;

/* Command codes */
var CMD_OPEID_READ = 0x00,
    CMD_BOOT_CODE_READ = 0x10,
    CMD_CPU_RATIO_READ = 0x20,
    CMD_CACHE_RATIO_READ = 0x24,
    CMD_BCLK_READ = 0x28,
    CMD_V1_READ = 0x30,
    CMD_V2_READ = 0x38,
    CMD_VCORE_READ = 0x40,
    CMD_DRAM_VOLTAGE_READ = 0x48,
    CMD_CPU_TEMPERATURE_READ = 0x50,
    CMD_FAN_SPEED_READ = 0x60;

console.log('Starting');

/* Display in HEX and zero pad */
function pad(n, width, z) {
  z = z || '0';
  n = n.toString(16) + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

/* Change endiannes / swap two bytes of a word */
function swap16(val) {
  return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
}

function toClk(rawValue) {
  return swap16(rawValue) * 0.1;
}

/* Volts conversion */
function toVolts(rawValue) {
  return swap16(rawValue) * 0.005;
}

/* Fan RPM conversion */
function toRPM(rawValue) {
  return swap16(rawValue);
}

i2c1 = i2c.open(1, function (err) {
  if (err) throw err;
  console.log('About to read');

  (function readAll() {
   console.log('Reading all Settings:');

   opeId = i2c1.readByteSync(ROGEXT_ADDR, CMD_OPEID_READ);
   console.log('opeID       : ' + opeId);

   bootCode = i2c1.readByteSync(ROGEXT_ADDR, CMD_BOOT_CODE_READ);
   console.log('Boot code:  : ' + bootCode.toString(16));

   cpuRatio = i2c1.readByteSync(ROGEXT_ADDR, CMD_CPU_RATIO_READ);
   console.log('CPU ratio   : ' + cpuRatio);

   cacheRatio = i2c1.readByteSync(ROGEXT_ADDR, CMD_CACHE_RATIO_READ);
   console.log('Cache ratio : ' + cacheRatio);

   rawBclk = i2c1.readWordSync(ROGEXT_ADDR, CMD_BCLK_READ);
   console.log('BCLK:       : ' + toClk(rawBclk) + ' (raw: ' + rawBclk + '/ 0x' + pad(rawBclk, 4) + ')');

   rawV1 = i2c1.readWordSync(ROGEXT_ADDR, CMD_V1_READ);
   console.log('V1          : ' + toVolts(rawV1) + ' V (raw: ' + rawV1 + '/ 0x' + pad(rawV1, 4) + ')');

   rawV2 = i2c1.readWordSync(ROGEXT_ADDR, CMD_V2_READ);
   console.log('V2          : ' + toVolts(rawV2) + ' V (raw: ' + rawV2 + '/ 0x' + pad(rawV2, 4) + ')');

   rawVcore = i2c1.readWordSync(ROGEXT_ADDR, CMD_VCORE_READ);
   console.log('VCORE       : ' + toVolts(rawVcore) + ' V (raw: ' + rawVcore + '/ 0x' + pad(rawVcore, 4) + ')');

   rawDram = i2c1.readWordSync(ROGEXT_ADDR, CMD_DRAM_VOLTAGE_READ);
   console.log('DRAM        : ' + toVolts(rawDram) + ' V (raw: ' + rawDram + '/ 0x' + pad(rawDram, 4) + ')');

   cpuTemp = i2c1.readByteSync(ROGEXT_ADDR, CMD_CPU_TEMPERATURE_READ);
   console.log('CPU temp    : ' + cpuTemp + ' degC');

   rawFan = i2c1.readWordSync(ROGEXT_ADDR, CMD_FAN_SPEED_READ);
   console.log('Fan         : ' + toRPM(rawFan) + ' RPM (raw: ' + rawFan + '/ 0x' + pad(rawFan, 4) + ')');

   console.log('');

   setTimeout(readAll, 3000); //to loop
 }());

});

i2c1.closeSync();
