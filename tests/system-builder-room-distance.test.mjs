import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ROOM_DISTANCE_SUGGESTIONS,
  suggestedListeningDistanceFt,
  suggestedListeningLevel,
  bindListeningDistanceDefaults
} from '../system-builder/listening-distance.mjs';

function field(value,defaultValue=value){
  const callbacks={};
  return {
    value,defaultValue,
    on(kind,fn){(callbacks[kind]??=[]).push(fn);},
    addEventListener(kind,fn){this.on(kind,fn);},
    emit(kind){for(const fn of callbacks[kind]||[])fn({target:this});}
  };
}
function fixture(initialRoom='living_room',initialDistance='8',initialLevel='moderate'){
  const room=field(initialRoom,'living_room');
  const distance=field(initialDistance,'8');
  const level=field(initialLevel,'moderate');
  level.querySelector=()=>({value:'moderate'});
  const hint={textContent:''},levelHint={textContent:''};
  const form={
    elements:{namedItem(k){return {useCase:room,distanceFt:distance,level}[k]}},
    querySelector(selector){return selector==='[data-distance-hint]'?hint:
      selector==='[data-level-hint]'?levelHint:null;},
    addEventListener(kind,fn){this.on(kind,fn);},
    on(kind,fn){(this.listeners??={})[kind]=fn;},
    emit(kind){this.listeners[kind]?.();}
  };
  bindListeningDistanceDefaults(form);
  return {form,room,distance,level,hint,levelHint};
}
test('room defaults cover living room, bedroom, desk, outdoors and gatherings',()=>{
  assert.deepEqual(
    Object.fromEntries(Object.keys(ROOM_DISTANCE_SUGGESTIONS).map(k=>
      [k,[suggestedListeningDistanceFt(k),suggestedListeningLevel(k)]])),
    {living_room:[8,'moderate'],bedroom:[6,'quiet'],desk:[2,'quiet'],
     outdoors:[15,'moderate'],party:[20,'high']});
  assert.equal(suggestedListeningDistanceFt('unexpected'),8);
});
test('room changes update both automatic distance and level',()=>{
  const f=fixture();
  for(const [room,feet,level] of [
    ['desk','2','quiet'],['bedroom','6','quiet'],
    ['outdoors','15','moderate'],['party','20','high'],
    ['living_room','8','moderate']]){
    f.room.value=room;f.room.emit('change');
    assert.equal(f.distance.value,feet,room);
    assert.equal(f.level.value,level,room);
  }
  assert.match(f.hint.textContent,/Editable|Edit for your actual seat/);
});
test('custom distance survives future space changes while level can remain automatic',()=>{
  const f=fixture();
  f.distance.value='11';f.distance.emit('input');
  f.room.value='party';f.room.emit('change');
  assert.equal(f.distance.value,'11');
  assert.equal(f.level.value,'high');
  assert.match(f.hint.textContent,/your 11 ft distance/);
});
test('custom loudness survives room changes, while distance can stay automatic',()=>{
  const f=fixture();
  f.level.value='high';f.level.emit('change');
  f.room.value='bedroom';f.room.emit('change');
  assert.equal(f.distance.value,'6');
  assert.equal(f.level.value,'high');
});
test('browser restored values are not replaced on load',()=>{
  const f=fixture('desk','3.5','high');
  assert.equal(f.distance.value,'3.5');
  assert.equal(f.level.value,'high');
});
test('form reset reinstates automatic defaults',async()=>{
  const f=fixture();
  f.distance.value='13';f.distance.emit('input');
  f.level.value='high';f.level.emit('change');
  // A native reset restores the original initial form values after dispatch.
  f.form.emit('reset');
  f.room.value='living_room';f.distance.value='8';f.level.value='moderate';
  await Promise.resolve();
  f.room.value='desk';f.room.emit('change');
  assert.equal(f.distance.value,'2');
  assert.equal(f.level.value,'quiet');
});
test('party profile is a planning scenario, not a safety recommendation',()=>{
  const f=fixture();
  f.room.value='party';f.room.emit('change');
  assert.match(f.levelHint.textContent,/not a recommended continuous listening volume/);
  f.room.value='outdoors';f.room.emit('change');
  assert.match(f.levelHint.textContent,/Outdoor distance/);
});
