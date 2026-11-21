/**
 * Small, editable starting distances for the Listener Builder.
 * These are illustrative seat-to-speaker distances in feet, not inferred
 * room dimensions, acoustic measurements, or fixed requirements.
 */
export const ROOM_DISTANCE_SUGGESTIONS=Object.freeze({
  living_room:{label:'living room',feet:8},
  bedroom:{label:'bedroom',feet:6},
  desk:{label:'desk',feet:2},
  outdoors:{label:'outdoor listening',feet:12},
  party:{label:'gathering or event',feet:15}
});

export function suggestedListeningDistanceFt(room){
  return ROOM_DISTANCE_SUGGESTIONS[room]?.feet??ROOM_DISTANCE_SUGGESTIONS.living_room.feet;
}

/**
 * Automatically follow the selected listening area until a visitor enters
 * their own distance. Do not discard their adjustment on subsequent changes.
 */
export function bindListeningDistanceDefaults(form){
  const room=form.elements.namedItem('useCase');
  const distance=form.elements.namedItem('distanceFt');
  if(!room||!distance)return;
  const hint=form.querySelector('[data-distance-hint]');
  // Respect an existing custom value restored by the browser.
  let automatic=distance.value===distance.defaultValue;
  const sync=()=>{
    const recommendation=ROOM_DISTANCE_SUGGESTIONS[room.value]||ROOM_DISTANCE_SUGGESTIONS.living_room;
    if(automatic)distance.value=String(recommendation.feet);
    if(hint)hint.textContent=automatic
      ?'Suggested for '+recommendation.label+': '+recommendation.feet+' ft. Editable.'
      :'Your distance: '+distance.value+' ft. Suggested for '+recommendation.label+': '+recommendation.feet+' ft.';
  };
  distance.addEventListener('input',()=>{
    automatic=false;
    sync();
  });
  room.addEventListener('change',sync);
  form.addEventListener('reset',()=>{
    // Native form reset restores the default option/value after this event.
    queueMicrotask(()=>{
      automatic=true;
      sync();
    });
  });
  sync();
}
