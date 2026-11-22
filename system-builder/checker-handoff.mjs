/**
 * Builder -> System Check handoff. Preserves selected gear and listening
 * scenario; does not invent fields that aren't in source-qualified evidence.
 */
export function checkerHandoffLink(item={},request={}) {
  if(item.architecture!=='passive_separates')return null;
  const params=new URLSearchParams();
  const distance=Number(request.distanceFt);
  if(Number.isFinite(distance)&&distance>=0.5&&distance<=300)
    params.set('distance',String(distance));
  const peak=request.level==='high'?95:request.level==='quiet'?80:90;
  params.set('peak',String(peak));
  params.set('average',String(peak-15));
  params.set('gap','15');

  const evidence=item.acousticEvidence;
  if(evidence && Number.isFinite(evidence.sensitivityDb1W1m) &&
    evidence.sensitivityDb1W1m>=40&&evidence.sensitivityDb1W1m<=130 &&
    Number.isFinite(evidence.nominalOhms)&&evidence.nominalOhms>=0.5 &&
    Number.isFinite(evidence.continuousWattsPerChannel)&&
    evidence.continuousWattsPerChannel>0) {
    if(evidence.speakerModel)params.set('speaker',evidence.speakerModel);
    if(evidence.amplifierModel)params.set('amp',evidence.amplifierModel);
    // Used only if the exact model is absent from System Check's older
    // presets. Always label these as transferred source-backed estimates.
    params.set('builderSensitivity',String(evidence.sensitivityDb1W1m));
    params.set('builderBasis','power');
    params.set('builderLoad',String(evidence.nominalOhms));
    params.set('builderAmpWatts',String(evidence.continuousWattsPerChannel));
    params.set('builderAmpOhms',String(evidence.nominalOhms));
  }
  return '/system-check/?'+params.toString();
}
