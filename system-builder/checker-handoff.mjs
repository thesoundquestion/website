/** Verified passive-system handoff; URL values stay user-editable in System Check. */
export function checkerHandoffLink(item={},request={}) {
  if(item.architecture!=='passive_separates')return null;
  const params=new URLSearchParams();
  const distance=Number(request.distanceFt);
  if(Number.isFinite(distance)&&distance>=0.5&&distance<=300){
    params.set('distance',String(distance));
    params.set('distanceFt',String(distance));
  }
  const profile=({
    quiet:[65,80],moderate:[80,95],high:[85,105]
  })[request.level]||[80,95];
  const avg=Number.isFinite(Number(request.averageDb))&&request.averageDb!=null?Number(request.averageDb):profile[0];
  const peak=Number.isFinite(Number(request.peakDb))&&request.peakDb!=null?Number(request.peakDb):profile[1];
  if(avg>=20&&peak>=avg&&peak<=135&&peak-avg<=50){
    params.set('average',String(avg));
    params.set('peak',String(peak));
    params.set('gap',String(peak-avg));
  }
  const modelSpeaker=item.speakerModel||item.curatedPairing?.speakerModel||item.acousticEvidence?.speakerModel;
  const modelAmp=item.amplifierModel||item.curatedPairing?.amplifierModel||item.acousticEvidence?.amplifierModel;
  if(modelSpeaker)params.set('speaker',String(modelSpeaker));
  if(modelAmp)params.set('amp',String(modelAmp));

  const evidence=item.acousticEvidence;
  if(evidence&&Number.isFinite(evidence.sensitivityDb1W1m)&&
    evidence.sensitivityDb1W1m>=40&&evidence.sensitivityDb1W1m<=130&&
    Number.isFinite(evidence.nominalOhms)&&evidence.nominalOhms>=0.5&&
    Number.isFinite(evidence.continuousWattsPerChannel)&&
    evidence.continuousWattsPerChannel>0&&
    (evidence.reference==='catalog_same_load_full_band'||
      (evidence.reference==='manufacturer_anechoic'&&
       Array.isArray(evidence.sourceUrls)&&evidence.sourceUrls.length>=2))){
    params.set('builderSensitivity',String(evidence.sensitivityDb1W1m));
    params.set('builderBasis','power');
    params.set('builderLoad',String(evidence.nominalOhms));
    params.set('builderAmpWatts',String(evidence.continuousWattsPerChannel));
    params.set('builderAmpOhms',String(evidence.nominalOhms));
    params.set('autocheck','1');
  }
  return '/system-check/?'+params.toString();
}
