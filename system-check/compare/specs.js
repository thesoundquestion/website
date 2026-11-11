'use strict';
/* Compare My Gear supplemental manufacturer specifications; deliberately kept separate from calculator presets. */
const compareGearDetails = {
  "version": "2026-11-11",
  "notice": "Supplemental, source-linked model facts. A blank value means the source did not establish the specification.",
  "speaker": {
    "DALI Oberon 1": {
      "configuration": "2-way",
      "drivers": "1 × 5.25″ wood-fibre LF/MF; 1 × 29 mm soft-dome HF",
      "enclosure": "Bass reflex",
      "frequencyResponse": "51 Hz–26 kHz",
      "responseBasis": "Manufacturer ±3 dB",
      "crossover": "2.8 kHz",
      "reference": "https://www.dali-speakers.com/media/5320/oberon-manual.pdf"
    },
    "DALI Oberon 3": {
      "configuration": "2-way",
      "drivers": "1 × 7″ wood-fibre LF/MF; 1 × 29 mm soft-dome HF",
      "enclosure": "Bass reflex",
      "frequencyResponse": "47 Hz–26 kHz",
      "responseBasis": "Manufacturer ±3 dB",
      "crossover": "2.4 kHz",
      "reference": "https://www.dali-speakers.com/media/5320/oberon-manual.pdf"
    },
    "DALI Oberon 5": {
      "configuration": "2-way",
      "drivers": "2 × 5.25″ wood-fibre LF/MF; 1 × 29 mm soft-dome HF",
      "enclosure": "Bass reflex",
      "frequencyResponse": "39 Hz–26 kHz",
      "responseBasis": "Manufacturer ±3 dB",
      "crossover": "2.4 kHz",
      "reference": "https://www.dali-speakers.com/media/5320/oberon-manual.pdf"
    },
    "DALI Oberon 7": {
      "configuration": "2-way",
      "drivers": "2 × 7″ wood-fibre LF/MF; 1 × 29 mm soft-dome HF",
      "enclosure": "Bass reflex",
      "frequencyResponse": "36 Hz–26 kHz",
      "responseBasis": "Manufacturer ±3 dB",
      "crossover": "2.3 kHz",
      "reference": "https://www.dali-speakers.com/media/5320/oberon-manual.pdf"
    },
    "ELAC Debut 2.0 B5.2": {
      "configuration": "2-way",
      "drivers": "5.25″ woven aramid-fibre woofer; 1″ cloth-dome tweeter",
      "enclosure": "Front-ported bass reflex",
      "frequencyResponse": "46 Hz–35 kHz",
      "responseBasis": "Manufacturer range; tolerance not stated",
      "crossover": "2.2 kHz",
      "reference": "https://elac.com/download/df52/owners-manual_1.0.0.pdf"
    },
    "ELAC Debut 2.0 B6.2": {
      "configuration": "2-way",
      "drivers": "6.5″ woven aramid-fibre woofer; 1″ cloth-dome tweeter",
      "enclosure": "Front-ported bass reflex",
      "frequencyResponse": "44 Hz–35 kHz",
      "responseBasis": "Manufacturer range; tolerance not stated",
      "crossover": "2.2 kHz",
      "reference": "https://elac.com/download/df52/owners-manual_1.0.0.pdf"
    },
    "ELAC Debut 3.0 DB53": {
      "configuration": "2-way",
      "drivers": "5.25″ aramid-fibre woofer; 1″ aluminium-dome tweeter",
      "enclosure": "Bass reflex",
      "frequencyResponse": "42 Hz–38 kHz",
      "responseBasis": "Manufacturer −6 dB range",
      "crossover": "1.9 kHz",
      "reference": "https://elac.com/download/debut-3-0/debut-3-0-sales-sheet_2.0.0.pdf"
    },
    "ELAC Debut 3.0 DB63": {
      "configuration": "2-way",
      "drivers": "6.5″ aramid-fibre woofer; 1″ aluminium-dome tweeter",
      "enclosure": "Bass reflex",
      "frequencyResponse": "42 Hz–38 kHz",
      "responseBasis": "Manufacturer −6 dB range",
      "crossover": "2.0 kHz",
      "reference": "https://elac.com/download/debut-3-0/debut-3-0-sales-sheet_2.0.0.pdf"
    },
    "ELAC Debut 3.0 DF63": {
      "configuration": "3-way",
      "drivers": "2 × 6.5″ aramid-fibre woofers; 6.5″ aramid-fibre midrange; 1″ aluminium-dome tweeter",
      "enclosure": "Bass reflex",
      "frequencyResponse": "31 Hz–38 kHz",
      "responseBasis": "Manufacturer −6 dB range",
      "crossover": "550 Hz / 2.0 kHz",
      "reference": "https://elac.com/download/debut-3-0/debut-3-0-sales-sheet_2.0.0.pdf"
    },
    "KEF Q150": {
      "configuration": "2-way coaxial Uni-Q",
      "drivers": "5.25″ aluminium LF/MF with coaxial 1″ vented aluminium-dome tweeter",
      "enclosure": "Bass reflex",
      "frequencyResponse": "51 Hz–28 kHz",
      "responseBasis": "Manufacturer ±3 dB",
      "crossover": "2.5 kHz",
      "reference": "https://assets.kef.com/uploads/cm/Q_Series_brochure_EN.pdf"
    },
    "KEF Q350": {
      "configuration": "2-way coaxial Uni-Q",
      "drivers": "6.5″ aluminium LF/MF with coaxial 1″ vented aluminium-dome tweeter",
      "enclosure": "Bass reflex",
      "frequencyResponse": "63 Hz–28 kHz",
      "responseBasis": "Manufacturer ±3 dB",
      "crossover": "2.5 kHz",
      "reference": "https://assets.kef.com/uploads/cm/Q_Series_brochure_EN.pdf"
    },
    "KEF Q550": {
      "configuration": "2.5-way",
      "drivers": "1 × 5.25″ aluminium Uni-Q LF/MF with 1″ coaxial aluminium-dome HF; 1 × 5.25″ powered LF; 2 × 5.25″ passive radiators",
      "enclosure": "Passive-radiator enclosure",
      "frequencyResponse": "58 Hz–28 kHz",
      "responseBasis": "Manufacturer ±3 dB (confirm exact regional revision)",
      "crossover": "2.5 kHz",
      "reference": "https://assets.kef.com/uploads/cm/Q_Series_brochure_EN.pdf"
    },
    "KEF Q750": {
      "configuration": "2.5-way",
      "drivers": "1 × 6.5″ aluminium Uni-Q LF/MF with 1″ coaxial aluminium-dome HF; 1 × 6.5″ powered LF; 2 × 6.5″ passive radiators",
      "enclosure": "Passive-radiator enclosure",
      "frequencyResponse": "48 Hz–28 kHz",
      "responseBasis": "Manufacturer ±3 dB (confirm exact regional revision)",
      "crossover": "2.5 kHz",
      "reference": "https://assets.kef.com/uploads/cm/Q_Series_brochure_EN.pdf"
    },
    "KEF Q950": {
      "configuration": "2.5-way",
      "drivers": "1 × 8″ aluminium Uni-Q LF/MF with 1.5″ coaxial aluminium-dome HF; 1 × 8″ powered LF; 2 × 8″ passive radiators",
      "enclosure": "Passive-radiator enclosure",
      "frequencyResponse": "44 Hz–28 kHz",
      "responseBasis": "Manufacturer ±3 dB (confirm exact regional revision)",
      "crossover": "2.5 kHz",
      "reference": "https://assets.kef.com/uploads/cm/Q_Series_brochure_EN.pdf"
    },
    "KEF LS50 Meta": {
      "configuration": "2-way coaxial Uni-Q",
      "drivers": "5.25″ aluminium LF/MF with coaxial 1″ vented aluminium-dome tweeter (MAT)",
      "enclosure": "Bass reflex",
      "frequencyResponse": "79 Hz–28 kHz",
      "responseBasis": "Manufacturer ±3 dB; free-field",
      "crossover": "2.1 kHz",
      "reference": "https://ca.kef.com/products/ls50-meta"
    },
    "Cerwin-Vega D-3": {
      "configuration": "3-way",
      "drivers": "Not verified; other driver sizes/materials not yet verified",
      "enclosure": "Not verified",
      "frequencyResponse": null,
      "responseBasis": null,
      "crossover": null,
      "reference": "https://hifigoteborg.se/pdf/Cerwin-Vega_speakers.pdf"
    },
    "Cerwin-Vega D-5": {
      "configuration": "3-way",
      "drivers": "12″ woofer; other driver sizes/materials not yet verified",
      "enclosure": "Not verified",
      "frequencyResponse": null,
      "responseBasis": null,
      "crossover": null,
      "reference": "https://hifigoteborg.se/pdf/Cerwin-Vega_speakers.pdf"
    },
    "Cerwin-Vega D-7": {
      "configuration": "3-way",
      "drivers": "12″ woofer; other driver sizes/materials not yet verified",
      "enclosure": "Not verified",
      "frequencyResponse": null,
      "responseBasis": null,
      "crossover": null,
      "reference": "https://hifigoteborg.se/pdf/Cerwin-Vega_speakers.pdf"
    },
    "Cerwin-Vega D-9": {
      "configuration": "3-way",
      "drivers": "15″ woofer; other driver sizes/materials not yet verified",
      "enclosure": "Not verified",
      "frequencyResponse": null,
      "responseBasis": null,
      "crossover": null,
      "reference": "https://hifigoteborg.se/pdf/Cerwin-Vega_speakers.pdf"
    },
    "Cerwin-Vega XLS-12": {
      "configuration": null,
      "drivers": "12″ woofer; other sizes/materials not yet verified",
      "enclosure": null,
      "frequencyResponse": null,
      "responseBasis": null,
      "crossover": null,
      "reference": "https://cerwinvega.com/products/xls-12"
    },
    "Cerwin-Vega XLS-15": {
      "configuration": null,
      "drivers": "15″ woofer; other sizes/materials not yet verified",
      "enclosure": null,
      "frequencyResponse": null,
      "responseBasis": null,
      "crossover": null,
      "reference": "https://cerwinvega.com/products/xls-15"
    },
    "Cerwin-Vega XLS-215": {
      "configuration": null,
      "drivers": "2 × 15″ woofers; other sizes/materials not yet verified",
      "enclosure": null,
      "frequencyResponse": null,
      "responseBasis": null,
      "crossover": null,
      "reference": "https://cerwinvega.com/products/xls-215"
    },
    "Yamaha NS-555": {
      "configuration": "3-way / 4 drivers",
      "drivers": "2 × 6.5″ PMD-cone woofers; 5″ cone midrange with waveguide; 1″ aluminium-dome HF with waveguide",
      "enclosure": "Bass reflex",
      "frequencyResponse": "35 Hz–35 kHz",
      "responseBasis": "Manufacturer range; tolerance not stated",
      "crossover": "1 kHz / 4 kHz",
      "reference": "https://ca.yamaha.com/en/audio/home-audio/products/speakers/ns-555/specs.html"
    },
    "Yamaha NS-777": {
      "configuration": "3-way / 4 drivers",
      "drivers": "2 × 8″ PMD-cone woofers; 5″ cone midrange with waveguide; 1″ aluminium-dome HF with waveguide",
      "enclosure": "Bass reflex",
      "frequencyResponse": "30 Hz–35 kHz",
      "responseBasis": "Manufacturer range; tolerance not stated",
      "crossover": "1 kHz / 4 kHz",
      "reference": "https://ca.yamaha.com/en/audio/home-audio/products/speakers/ns-777/specs.html"
    },
    "Yamaha NS-6490 (Canada)": {
      "configuration": "3-way",
      "drivers": "8″ cone woofer; 4″ cone midrange; 7/8″ balanced-dome tweeter",
      "enclosure": "Sealed / acoustic suspension",
      "frequencyResponse": "45 Hz–23 kHz",
      "responseBasis": "Manufacturer range; tolerance not stated",
      "crossover": "2.5 kHz / 8 kHz",
      "reference": "https://ca.yamaha.com/en/audio/home-audio/products/speakers/ns-6490/",
      "detailNote": "Canadian listing: 6 Ω. US regional page lists 8 Ω; do not mix versions."
    },
    "Paradigm Monitor SE 6000F": {
      "configuration": "3-way / 5 drivers",
      "drivers": "3 × 5.5″ mineral-filled polypropylene woofers; 5.5″ mineral-filled polypropylene midrange; 1″ X-PAL metal-dome tweeter",
      "enclosure": "Bass reflex",
      "frequencyResponse": "53 Hz–21 kHz",
      "responseBasis": "Manufacturer ±3 dB, on axis",
      "crossover": "800 Hz / 3 kHz",
      "reference": "https://www.paradigm.com/en/floorstanding/monitor-se-6000f"
    },
    "Paradigm Monitor SE Atom": {
      "configuration": "2-way",
      "drivers": "5.5″ mineral-filled polypropylene woofer; 1″ X-PAL tweeter",
      "enclosure": "Bass reflex",
      "frequencyResponse": "61 Hz–21 kHz",
      "responseBasis": "Manufacturer ±3 dB, on axis",
      "crossover": null,
      "reference": "https://www.paradigm.com/en/passive/monitor-se-atom"
    },
    "Klipsch Forte II": {
      "configuration": "3-way",
      "drivers": "12″ active woofer; horn-loaded midrange and tweeter; 15″ passive bass radiator",
      "enclosure": "Passive-radiator enclosure",
      "frequencyResponse": "32 Hz–20 kHz",
      "responseBasis": "Manufacturer ±3 dB",
      "crossover": null,
      "reference": "https://assets.klipsch.com/product-specsheets/forte-II-brochure.pdf"
    },
    "Klipsch RP-600M II": {
      "configuration": "2-way",
      "drivers": "6.5″ Cerametallic LF/MF; 1″ vented titanium LTS tweeter with Tractrix horn",
      "enclosure": "Rear-ported bass reflex",
      "frequencyResponse": "44 Hz–25 kHz",
      "responseBasis": "Manufacturer ±3 dB",
      "crossover": "1.5 kHz",
      "reference": "https://assets.klipsch.com/product-specsheets/RP-600M-II_Spec-Sheet_v02.pdf"
    },
    "JBL L100 Classic": {
      "configuration": "3-way",
      "drivers": "12″ pure-pulp woofer; 5.25″ polymer-coated pulp midrange; 1″ titanium-dome tweeter",
      "enclosure": "Front-ported bass reflex",
      "frequencyResponse": "40 Hz–40 kHz",
      "responseBasis": "Manufacturer −6 dB",
      "crossover": "450 Hz / 2.5 kHz",
      "reference": "https://ca.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw1e4dfbc0/pdfs/SC03671_JBL_L100_Classic_Spec%20Sheet_EN_LR.pdf"
    },
    "Wharfedale Diamond 12.1": {
      "configuration": "2-way",
      "drivers": "5″ advanced polypropylene-cone LF/MF; 1″ textile-dome tweeter",
      "enclosure": "Bass reflex",
      "frequencyResponse": "65 Hz–20 kHz",
      "responseBasis": "Manufacturer ±3 dB; bass −6 dB at 60 Hz",
      "crossover": "2.6 kHz",
      "reference": "https://www.wharfedale.co.uk/collections/diamond-12-series/products/diamond-12-1"
    },
    "Wharfedale Diamond 12.2": {
      "configuration": "2-way",
      "drivers": "6.5″ advanced polypropylene-cone LF/MF; 1″ textile-dome tweeter",
      "enclosure": "Bass reflex",
      "frequencyResponse": "50 Hz–20 kHz",
      "responseBasis": "Manufacturer ±3 dB; bass −6 dB at 43 Hz",
      "crossover": "2.0 kHz",
      "reference": "https://www.wharfedale.co.uk/collections/diamond-12-series/products/diamond-12-2"
    },
    "Wharfedale Diamond 12.3": {
      "configuration": "2.5-way",
      "drivers": "2 × 5″ advanced polypropylene-cone LF/MF; 1″ textile-dome tweeter",
      "enclosure": "Bass reflex",
      "frequencyResponse": "45 Hz–20 kHz",
      "responseBasis": "Manufacturer ±3 dB; bass −6 dB at 40 Hz",
      "crossover": "2.2 kHz",
      "reference": "https://www.wharfedale.co.uk/collections/diamond-12-series/products/diamond-12-3"
    },
    "Q Acoustics 3020i": {
      "configuration": "2-way",
      "drivers": "5″ bass/midrange; 0.9″ decoupled tweeter",
      "enclosure": "Bass reflex",
      "frequencyResponse": "64 Hz–30 kHz",
      "responseBasis": "Manufacturer +3/−6 dB",
      "crossover": "2.4 kHz",
      "reference": "https://www.qacoustics.com/products/3020i-bookshelf-speaker-pair"
    },
    "Sony SS-CS5 (original)": {
      "configuration": "3-way / 3 drivers",
      "drivers": "5.12″ cone woofer; 1″ dome tweeter; separate super-tweeter (diameter not listed on support page)",
      "enclosure": "Bass reflex",
      "frequencyResponse": "53 Hz–50 kHz",
      "responseBasis": "Manufacturer range; tolerance not stated",
      "crossover": null,
      "reference": "https://www.sony.ca/en/electronics/support/speakers-wired-speakers/ss-cs5/specifications"
    }
  },
  "source": {
    "Creative Sound Blaster X-Fi Titanium HD (RCA)": {
      "converter": "Creative X-Fi PC sound-card DAC",
      "digitalInputs": "PCIe audio; S/PDIF optical input/output",
      "pcmUSB": "Stereo playback up to 24-bit / 192 kHz (regional specification); RCA DAC quality claim 24-bit / 96 kHz",
      "pcmSpdif": "Optical digital I/O up to 24-bit / 96 kHz",
      "dsd": null,
      "analogResponse": null,
      "reference": "https://jp.creative.com/corporate/pressroom?id=13159",
      "detailNote": "Creative's regional material lists 24/192 stereo playback, while its English release specifies 24/96 performance for the RCA converters. Actual available rates depend on driver and output mode."
    },
    "iFi ZEN DAC V2 (fixed RCA)": {
      "converter": "Burr-Brown DAC architecture",
      "digitalInputs": "USB-B",
      "pcmUSB": "PCM up to 24/32-bit / 384 kHz",
      "pcmSpdif": null,
      "dsd": "DSD64–DSD256 (USB)",
      "analogResponse": "Not verified with a published analogue passband tolerance",
      "reference": "https://downloads.ifi-audio.com/wp-content/uploads/2021/04/iFi_ZENDAC_V2_Lowdown.pdf",
      "detailNote": "Fixed RCA values shown; 4.4 mm balanced and headphone jacks have different levels and impedance."
    },
    "Schiit Modi+ (RCA)": {
      "converter": null,
      "digitalInputs": "USB-C, optical, coaxial",
      "pcmUSB": null,
      "pcmSpdif": null,
      "dsd": null,
      "analogResponse": null,
      "reference": "https://audiochainsdb.com/en/gear/schiit-modi-plus",
      "detailNote": "Archived Modi+ limits/chip require model-specific source verification. Do not substitute current Modi 5 specifications."
    },
    "SMSL SU-1 (RCA)": {
      "converter": "AKM AK4493S",
      "digitalInputs": "USB-C, optical S/PDIF, coaxial S/PDIF",
      "pcmUSB": "PCM up to 32-bit / 768 kHz",
      "pcmSpdif": "PCM input limits: consult unit manual",
      "dsd": "DSD512 (USB)",
      "analogResponse": null,
      "reference": "https://www.smsl-audio.com/portal/product/detail/id/889"
    },
    "Topping E30 II (RCA)": {
      "converter": "Dual AKM AK4493S",
      "digitalInputs": "USB, optical S/PDIF, coaxial S/PDIF",
      "pcmUSB": "PCM 16–32-bit / 44.1–768 kHz",
      "pcmSpdif": "PCM 16–24-bit / 44.1–192 kHz",
      "dsd": "USB DSD64–512 native, up to DSD256 DoP",
      "analogResponse": "20 Hz–20 kHz (±0.3 dB); USB 96 kHz test",
      "reference": "https://dl.topping.audio/usermanual/e30ii.pdf"
    },
    "WiiM Pro Plus (RCA)": {
      "converter": "AKM AK4493SEQ",
      "digitalInputs": "Wi-Fi/Ethernet streaming; optical input; RCA analogue input",
      "pcmUSB": "Streaming device; per-source rates vary",
      "pcmSpdif": "Optical/coax output PCM up to 24-bit / 192 kHz",
      "dsd": null,
      "analogResponse": "20 Hz–20 kHz (±0.1 dB)",
      "reference": "https://www.wiimhome.com/products/wiim-pro-plus/?resource=banner",
      "detailNote": "24/192 is the supported digital I/O format, not a statement that the streaming service always supplies that resolution. WiiM states up to 32/384 processing for its analog DAC path."
    }
  },
  "headphone": {
    "Grado SR80e": {
      "transducer": "Dynamic, open-back on-ear",
      "driverSize": null,
      "diaphragm": null,
      "frequencyResponse": null,
      "responseBasis": "Not independently source-verified",
      "connector": "3.5 mm analogue",
      "reference": "https://www.digitec-derouet.com/photos/sr_80_e.pdf"
    },
    "Grado SR80x": {
      "transducer": "Dynamic, open-back on-ear",
      "driverSize": null,
      "diaphragm": null,
      "frequencyResponse": null,
      "responseBasis": "Not independently source-verified",
      "connector": "3.5 mm analogue",
      "reference": "https://www.gradothailand.com/en/product/sr80x/"
    },
    "Moondrop Chu II": {
      "transducer": "Dynamic in-ear monitor",
      "driverSize": "10 mm",
      "diaphragm": "Aluminium-magnesium alloy composite dome",
      "frequencyResponse": "15 Hz–38 kHz",
      "responseBasis": "Manufacturer claimed range; effective FR 20 Hz–20 kHz (IEC 60318-4, −3 dB)",
      "connector": "0.78 mm 2-pin cable / 3.5 mm plug",
      "reference": "https://moondroplab.com/en-products/chu-ii"
    },
    "Sennheiser HD 560S": {
      "transducer": "Dynamic open-back over-ear",
      "driverSize": null,
      "diaphragm": null,
      "frequencyResponse": "6 Hz–38 kHz",
      "responseBasis": "Manufacturer range; tolerance not stated",
      "connector": "3.5 mm analogue / 6.3 mm adapter",
      "reference": "https://support.sennheiser-hearing.com/hc/en-dk/articles/38271134258077-HD-560S-Specifications"
    },
    "Sennheiser HD 600": {
      "transducer": "Dynamic open-back over-ear",
      "driverSize": null,
      "diaphragm": null,
      "frequencyResponse": "12 Hz–40.5 kHz",
      "responseBasis": "Manufacturer range; tolerance not stated",
      "connector": "Detachable analogue cable",
      "reference": "https://support.sennheiser-hearing.com/hc/en-dk/articles/38292415494173-HD-600-Specifications"
    },
    "Shure SE215": {
      "transducer": "Single dynamic MicroDriver IEM",
      "driverSize": null,
      "diaphragm": null,
      "frequencyResponse": "22 Hz–17.5 kHz",
      "responseBasis": "Manufacturer range; standard SE215, not Special Edition",
      "connector": "MMCX detachable cable",
      "reference": "https://www.shure.com/en-US/docs/guide/SE215"
    },
    "Sony MDR-7506": {
      "transducer": "Dynamic closed-back over-ear",
      "driverSize": "40 mm",
      "diaphragm": "PET dome; neodymium magnet",
      "frequencyResponse": "10 Hz–20 kHz",
      "responseBasis": "Manufacturer range; tolerance not stated",
      "connector": "Coiled cable, 3.5 mm / 6.3 mm adapter",
      "reference": "https://pro.sony/en_NA/pdf/mdr-7506",
      "detailNote": "Pro Sony datasheet specifies 63 Ω. Some regional consumer pages incorrectly show 24 Ω; the preset uses the Pro datasheet."
    }
  }
};
