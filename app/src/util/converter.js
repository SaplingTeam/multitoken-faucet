import BigNumber from "bignumber.js";

export var BigNumberRD = BigNumber.clone({ ROUNDING_MODE: 1 });
export var BigNumber2RD = BigNumberRD.clone({ DECIMAL_PLACES: 2 });
var BN0 = BigNumberRD.clone({ DECIMAL_PLACES: 0 });

function tokenToDisplayValue(valueStr, valueDecimals, displayDecimals) {
  let BN2 = BigNumberRD.clone({ DECIMAL_PLACES: displayDecimals });

  let divisor = new BigNumber(10).exponentiatedBy(new BigNumber(valueDecimals));
  return new BN2(new BigNumber(valueStr).dividedBy(divisor)).toFormat(displayDecimals);
}

function displayToTokenValue(valueStr, valueDecimals) {
  let divisor = new BigNumber(10).exponentiatedBy(new BigNumber(valueDecimals));
  return new BigNumberRD(valueStr.replaceAll(',', '')).multipliedBy(divisor).integerValue().toString(10);
}

function percentToDisplayValue(valueStr, valueDecimals, displayDecimals) {
  let BN2 = BigNumberRD.clone({ DECIMAL_PLACES: displayDecimals });
  let divisor = new BigNumber(10).exponentiatedBy(new BigNumber(valueDecimals));
  return new BN2(new BigNumber(valueStr).dividedBy(divisor)).toFormat(displayDecimals);
}

function secondsToDays(seconds) {
  return new BN0(seconds).dividedToIntegerBy(86400).toString(10);
}

function daysToSeconds(seconds) {
  return new BN0(seconds).multipliedBy(86400).toString(10);
}

const converter = {
  tokenToDisplayValue,
  displayToTokenValue,
  percentToDisplayValue,
  secondsToDays,
  daysToSeconds,
};

export default converter;
