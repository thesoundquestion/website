/**
 * Beginner-friendly planning presets for the Listening Builder.
 * These are editorial starting assumptions, NOT average population measurements
 * or recommended continuous exposure levels. All can be edited.
 */
export const ROOM_DISTANCE_SUGGESTIONS=Object.freeze({
  living_room:{label:'living room',feet:8,level:'moderate',context:'Seated indoor listening'},
  bedroom:{label:'bedroom',feet:6,level:'quiet',context:'Closer, quieter listening'},
  desk:{label:'desk',feet:2,level:'quiet',context:'Nearfield listening'},
  outdoors:{label:'outdoor listening',feet:15,level:'moderate',context:'A listener on a patio or lawn'},
  party:{label:'gathering or event',feet:20,level:'high',context:'A representative listener farther from the speakers'}
});
const defaultRoom=()=>ROOM_DISTANCE_SUGGESTIONS.living_room;
export function suggestedListeningDistanceFt(room){
  return (ROOM_DISTANCE_SUGGESTIONS[room]||defaultRoom()).feet;
}
export function suggestedListeningLevel(room){
  return (ROOM_DISTANCE_SUGGESTIONS[room]||defaultRoom()).level;
}

/**
 * Change suggested distance/level with the space only while they are automatic.
 * Preserve each independently after a visitor changes it.
 * A genuine form reset restores context-sensitive automatic behaviour.
 */
export function bindListeningDistanceDefaults(form){
  const room=form.elements.namedItem('useCase');
  const distance=form.elements.namedItem('distanceFt');
  const level=form.elements.namedItem('level');
  if(!room||!distance)return;
  const hint=form.querySelector('[data-distance-hint]');
  const levelHint=form.querySelector('[data-level-hint]');
  const defaultDistance=String(distance.defaultValue);
  const defaultLevel=level?.querySelector('option:checked')?.value||'moderate';
  // Respect browser-restored custom selections.
  let autoDistance=distance.value===defaultDistance;
  let autoLevel=!level||level.value===defaultLevel;
  const refresh=()=>{
    const preset=ROOM_DISTANCE_SUGGESTIONS[room.value]||defaultRoom();
    if(autoDistance)distance.value=String(preset.feet);
    if(autoLevel&&level)level.value=preset.level;
    if(hint){
      hint.textContent=autoDistance
        ?'Suggested: '+preset.feet+' ft for '+preset.label+'. Edit for your actual seat.'
        :'Using your '+distance.value+' ft distance. '+preset.label+' example: '+preset.feet+' ft.';
    }
    if(levelHint){
      const description={
        quiet:'quiet/background',moderate:'comfortable/normal',high:'louder with clean peaks'
      };
      const selected=level?.value||preset.level;
      const guidance=room.value==='party'
        ?' Higher-output example, not a recommended continuous listening volume.'
        :room.value==='outdoors'
          ?' Outdoor distance usually demands more output than the same indoor seat.'
          :'';
      levelHint.textContent=(autoLevel?'Suggested: ':'Your choice: ')+
        (description[selected]||selected)+'.'+guidance;
    }
  };
  distance.addEventListener('input',()=>{autoDistance=false;refresh();});
  if(level)level.addEventListener('change',()=>{autoLevel=false;refresh();});
  room.addEventListener('change',refresh);
  form.addEventListener('reset',()=>{
    queueMicrotask(()=>{
      autoDistance=true;
      autoLevel=true;
      refresh();
    });
  });
  refresh();
}
