/** Optional nominal-load headphone demand model. dB/mW and dB/V are distinct. */
export function headphoneDriveRequirement({impedanceOhms,sensitivityDb,basis,targetDb=95}={}){
  const z=Number(impedanceOhms),s=Number(sensitivityDb),t=Number(targetDb);
  if(!Number.isFinite(z)||z<1||z>1000||!Number.isFinite(s)||s<50||s>140||
    !Number.isFinite(t)||t<60||t>115)
    return {status:'insufficient_specs',voltsRms:null,milliwatts:null,milliampsRms:null};
  if(basis!=='power'&&basis!=='voltage')
    return {status:'basis_unknown',voltsRms:null,milliwatts:null,milliampsRms:null};
  // power: dB SPL/mW at 1 mW. voltage: dB SPL at 1 V RMS.
  const voltsRms=basis==='voltage'?10**((t-s)/20):Math.sqrt(10**((t-s)/10)*z/1000);
  return {status:'estimated_requirement',voltsRms,
    milliwatts:voltsRms**2/z*1000,milliampsRms:voltsRms/z*1000,targetDb:t};
}
