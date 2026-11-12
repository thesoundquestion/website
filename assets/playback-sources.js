/* Playback Sources: no external dependencies, analytics, audio playback or user data transfer. */
(() => {
  'use strict';
  const choices = {
    vinyl: {
      title: 'Vinyl record with a moving-magnet cartridge',
      description: 'Mechanical motion becomes a low-voltage analogue signal. The phono stage supplies the correct gain and complementary RIAA playback equalization.',
      nodes: [
        ['Vinyl groove','Physical movement','analogue'],
        ['Stylus + MM cartridge','Small electrical signal','analogue'],
        ['Phono stage','Gain + RIAA playback EQ','convert'],
        ['Amplifier line input','Analogue line-level signal','analogue'],
        ['Speakers','Acoustic pressure','output']
      ],
      note: 'A turntable with a built-in phono stage can feed an ordinary line input. If the stage is absent, a typical MM cartridge needs a suitable MM phono input or external phono preamp.'
    },
    cd: {
      title:'Compact disc player using its analogue RCA outputs',
      description:'The CD stores digital 16-bit / 44.1 kHz stereo PCM. The player recovers the digital signal and converts it to analogue before its RCA outputs.',
      nodes:[
        ['Audio CD','16-bit / 44.1 kHz PCM','digital'],
        ['Transport + decoder','Reads and corrects disc data','digital'],
        ['Built-in DAC','Digital → analogue','convert'],
        ['Amplifier line input','Analogue RCA signal','analogue'],
        ['Speakers','Acoustic pressure','output']
      ],
      note:'A CD transport with only optical/coaxial digital output needs a DAC somewhere downstream. A full CD player with analogue RCA outputs already contains one.'
    },
    soundcard: {
      title:'Computer playback through an internal sound card',
      description:'Files are decoded in software. The OS mixer, effects and resampling may intervene; the sound card DAC converts the final digital stream to analogue.',
      nodes:[
        ['Music file','FLAC / WAV / MP3 / AAC','digital'],
        ['Player + OS audio','Decode, mix or resample','digital'],
        ['Sound card DAC','Digital → analogue','convert'],
        ['Amplifier line input','Analogue RCA or line out','analogue'],
        ['Speakers','Acoustic pressure','output']
      ],
      note:'A sound card is not inherently inferior to a standalone DAC. Its analogue-output measurements, driver path, connections and grounding determine performance.'
    },
    usb: {
      title:'Computer or phone feeding a standalone USB DAC',
      description:'The host sends digital audio to an external DAC. Moving the converter outside the computer is an architectural choice, not a guarantee of better sound.',
      nodes:[
        ['Music file / service','Digital programme','digital'],
        ['Player + host audio','Optional DSP or resampling','digital'],
        ['USB DAC','Digital → analogue','convert'],
        ['Amplifier line input','Analogue RCA / balanced','analogue'],
        ['Speakers','Acoustic pressure','output']
      ],
      note:'USB carries digital audio. The USB DAC needs a compatible host and suitable analogue output for the amplifier. A “32-bit / 768 kHz” input claim is not itself an audible-quality score.'
    },
    streamer: {
      title:'Network streamer using its internal DAC',
      description:'A streamer obtains audio from a local server or online service; if using analogue outputs, its internal DAC converts the decoded digital audio.',
      nodes:[
        ['Music server / service','Stream or file','digital'],
        ['Network streamer','Receive, buffer, decode','digital'],
        ['Internal DAC','Digital → analogue','convert'],
        ['Amplifier line input','Analogue RCA output','analogue'],
        ['Speakers','Acoustic pressure','output']
      ],
      note:'Digital-only streamer outputs require a DAC somewhere downstream. Bluetooth delivery is not automatically lossless; what matters is the selected codec and transport.'
    },
    tape: {
      title:'Cassette deck via analogue line outputs',
      description:'A tape head turns recorded magnetic changes into an electrical signal; playback preamplification and equalization happen inside the deck.',
      nodes:[
        ['Magnetic tape','Stored analogue pattern','analogue'],
        ['Playback head','Small electrical signal','analogue'],
        ['Deck preamp + EQ','Gain / playback correction','convert'],
        ['Amplifier line input','Analogue RCA signal','analogue'],
        ['Speakers','Acoustic pressure','output']
      ],
      note:'Tape playback introduces mechanical speed stability, tape/head alignment and noise considerations. The deck’s normal LINE OUT is not a raw phono-cartridge output.'
    }
  };
  const board = document.querySelector('[data-ps-chain]');
  const caption = document.querySelector('[data-ps-caption]');
  const title = document.querySelector('[data-ps-title]');
  const description = document.querySelector('[data-ps-description]');
  const buttons = [...document.querySelectorAll('[data-ps-path]')];
  if (board && caption && title && description && buttons.length) {
    function render(name) {
      const info = choices[name];
      if (!info) return;
      const fragments = document.createDocumentFragment();
      for (const [name,sub,signal] of info.nodes) {
        const node = document.createElement('div');
        node.className = 'ps-chain-node';
        node.dataset.signal = signal;
        const kicker = document.createElement('small');
        kicker.textContent = signal === 'digital' ? 'Digital' : signal === 'analogue' ? 'Analogue' : signal === 'convert' ? 'Signal processing / conversion' : 'Physical output';
        const heading = document.createElement('strong');
        heading.textContent = name;
        const explanation = document.createElement('span');
        explanation.textContent = sub;
        node.append(kicker,heading,explanation);
        fragments.append(node);
      }
      board.replaceChildren(fragments);
      title.textContent = info.title;
      description.textContent = info.description;
      caption.textContent = info.note;
      for (const button of buttons) {
        const pressed = button.dataset.psPath === name;
        button.setAttribute('aria-pressed',String(pressed));
      }
    }
    for (const button of buttons) button.addEventListener('click', () => render(button.dataset.psPath));
    render('vinyl');
    document.querySelector('[data-ps-controls]').hidden = false;
  }

  const left = document.querySelector('#ps-source-type');
  const right = document.querySelector('#ps-amplifier-input');
  const result = document.querySelector('#ps-match-result');
  if (left && right && result) {
    const sources = {
      'mm':{output:'phono-mm',label:'Moving-magnet turntable, no phono stage'},
      'mc':{output:'phono-mc',label:'Moving-coil turntable, no phono stage'},
      'tt-line':{output:'line',label:'Turntable with phono preamp enabled'},
      'cd-line':{output:'line',label:'CD player RCA line out'},
      'cd-digital':{output:'optical',label:'CD transport optical digital out'},
      'pc-line':{output:'line',label:'Computer sound card analogue out'},
      'pc-usb':{output:'usb',label:'Computer USB audio output'},
      'stream-line':{output:'line',label:'Streamer analogue output'},
      'stream-digital':{output:'optical',label:'Streamer optical digital output'},
      'tape-line':{output:'line',label:'Cassette deck line out'}
    };
    const destinations = {
      line:{accept:'line',label:'Amplifier AUX / CD / TAPE analogue input'},
      mm:{accept:'phono-mm',label:'Amplifier MM PHONO input'},
      mc:{accept:'phono-mc',label:'Amplifier MC PHONO input'},
      optical:{accept:'optical',label:'Amplifier optical digital input with DAC'},
      usb:{accept:'usb',label:'Amplifier USB digital-audio input with DAC'}
    };
    function matching() {
      const src = sources[left.value], dst = destinations[right.value];
      if (!src || !dst) return;
      let state='missing',head='',body='';
      if (src.output===dst.accept) {
        state='ready';head='Compatible signal types';
        body=src.output==='line'?'Connect using the appropriate analogue cable. Start at low volume; output level, gain and input overload margins still need checking.':src.output.startsWith('phono-')?'An appropriate cartridge-specific phono input can supply gain and RIAA playback equalization. Check cartridge loading and the amplifier manual.':'The amplifier includes a compatible digital-audio input and DAC in this example. Confirm connector format and supported sample rates.';
      } else if (src.output==='line' && dst.accept.startsWith('phono')) {
        state='warning';head='Do not feed a line output into a phono input';
        body='A line source already has line-level voltage. A phono input adds gain and playback EQ, causing severe level and tonal mismatch. Use AUX/CD/TAPE instead.';
      } else if (src.output.startsWith('phono-') && dst.accept==='line') {
        state='missing';head='A phono stage is missing';
        body='The raw cartridge signal needs an appropriate MM or MC phono preamp (with RIAA playback equalization) before a normal line input.';
      } else if (src.output.startsWith('phono-') && dst.accept.startsWith('phono-')) {
        state='warning';head='Check MM versus MC cartridge compatibility';
        body='MM and MC inputs are not interchangeable by default. Confirm cartridge output, gain and loading. Some phono stages support both with selectable modes.';
      } else if (src.output==='usb' && dst.accept==='optical') {
        state='missing';head='USB cannot plug directly into an optical input';
        body='Use a compatible USB audio DAC/interface with analogue outputs, or a correctly supported digital-interface converter.';
      } else if (src.output==='optical' && dst.accept==='usb') {
        state='missing';head='Optical digital audio is not USB audio';
        body='Use an optical-input DAC, or a compatible optical-to-USB digital interface designed for this use.';
      } else if (src.output==='optical' && dst.accept==='line') {
        state='missing';head='A digital-to-analogue converter is missing';
        body='Use a DAC with the matching optical input, then connect its analogue output to the amplifier line input.';
      } else if (src.output==='usb' && dst.accept==='line') {
        state='missing';head='A USB DAC is required';
        body='A USB host normally sends digital audio. Add a compatible USB DAC with analogue line outputs before connecting to this amplifier.';
      } else if (src.output==='line' && ['optical','usb'].includes(dst.accept)) {
        state='missing';head='Analogue audio cannot connect directly to this digital input';
        body='Use a normal analogue amplifier input. Converting analogue to digital would require an ADC, and is unnecessary when a line input is available.';
      } else {
        state='warning';head='These connection types do not directly match';
        body='Check the signal type and connector. A supported converter or a different input is needed; matching plug shapes alone is not enough.';
      }
      result.dataset.state=state;
      result.replaceChildren();
      const heading=document.createElement('strong');
      heading.textContent=head;
      const text=document.createElement('p');
      text.textContent=body;
      result.append(heading,text);
    }
    left.addEventListener('change',matching);
    right.addEventListener('change',matching);
    matching();
  }

  // RIAA playback EQ is modeled as the standard analog transfer-function magnitude,
  // H(s)=(1+s*318us)/[(1+s*3180us)(1+s*75us)], normalized at 1 kHz.
  // Curves are original calculations, not recorded or measured performance.
  const plot=document.querySelector('#ps-riaa-svg');
  if(plot){
    const fallback = plot.querySelector('text');
    if (fallback) fallback.remove();
    const ns='http://www.w3.org/2000/svg',W=720,H=324,left=55,right=695,top=22,bottom=276;
    const frequencies=[20,50,100,200,500,1000,2000,5000,10000,20000],amps=[-20,-10,0,10,20];
    const x=f=>left+(Math.log10(f)-Math.log10(20))/(Math.log10(20000)-Math.log10(20))*(right-left);
    const y=d=>bottom-(d+22)/44*(bottom-top);
    const mag=f=>{
      const w=2*Math.PI*f;
      return Math.sqrt(1+(w*318e-6)**2)/Math.sqrt((1+(w*3180e-6)**2)*(1+(w*75e-6)**2));
    };
    const ref=mag(1000),dB=f=>20*Math.log10(mag(f)/ref);
    const make=(type,props,text)=>{const e=document.createElementNS(ns,type);for(const [k,v] of Object.entries(props))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;plot.append(e);return e};
    for(const a of amps){const yy=y(a);make('line',{x1:left,y1:yy,x2:right,y2:yy,class:'ps-svg-grid'});make('text',{x:left-9,y:yy+4,'text-anchor':'end',class:'ps-svg-axis'},(a>0?'+':'')+a);}
    for(const f of frequencies){const xx=x(f);make('line',{x1:xx,y1:top,x2:xx,y2:bottom,class:'ps-svg-grid'});make('text',{x:xx,y:bottom+20,'text-anchor':'middle',class:'ps-svg-axis'},f>=1000?f/1000+'k':String(f));}
    make('text',{x:left-8,y:11,class:'ps-svg-axis'},'Relative level (dB)');
    make('text',{x:right,y:H-8,'text-anchor':'end',class:'ps-svg-axis'},'Frequency (Hz, logarithmic)');
    const line=[];
    for(let i=0;i<=240;i++){const f=20*1000**(i/240);line.push((i===0?'M':'L')+x(f).toFixed(2)+' '+y(dB(f)).toFixed(2));}
    const curve=make('path',{d:line.join(' '),class:'ps-svg-riaa',id:'ps-riaa-curve'});
    const base=make('line',{x1:left,x2:right,y1:y(0),y2:y(0),class:'ps-svg-base',id:'ps-flat-line'});
    const toggle=document.querySelector('#ps-flat-toggle');
    if(toggle)toggle.addEventListener('change',()=>{base.hidden=!toggle.checked;base.setAttribute('visibility',toggle.checked?'visible':'hidden')});
    const phono=document.querySelector('#ps-riaa-toggle');
    if(phono)phono.addEventListener('change',()=>{curve.setAttribute('visibility',phono.checked?'visible':'hidden')});
  }
})();