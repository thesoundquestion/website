'use strict';

const systemCheckGear = {
  "speaker": [
    {
      "model": "Axiom Audio Vocal Point VP-100 (original)",
      "values": {
        "load": 8
      },
      "note": "8 Ω. Enter sensitivity from a source specific to the original cabinet. For a centre-channel estimate, choose One speaker under Fine-tune.",
      "url": "https://www.axiomaudio.com/faqs"
    },
    {
      "model": "Cerwin-Vega AT-15",
      "values": {
        "sensitivity": 102,
        "basis": "power",
        "load": 4
      },
      "note": "15-inch three-way. The period Stereo Directory lists 102 dB at 1 W / 3.28 ft and 4 Ω nominal.",
      "url": "https://www.worldradiohistory.com/Archive-All-Audio/Archive-HiFI-Stereo/SPECIALS/Stereo-Directory-1995.pdf"
    },
    {
      "model": "Cerwin-Vega D-3",
      "values": {
        "sensitivity": 94,
        "basis": "power",
        "load": 8
      },
      "note": "Original D-Series brochure. Sensitivity is for one speaker at 1 W / 3.28 ft.",
      "url": "https://hifigoteborg.se/pdf/Cerwin-Vega_speakers.pdf"
    },
    {
      "model": "Cerwin-Vega D-5",
      "values": {
        "sensitivity": 96,
        "basis": "power",
        "load": 8
      },
      "note": "12-inch three-way. The original D-Series brochure lists 96 dB at 1 W / 3.28 ft and 8 Ω nominal.",
      "url": "https://hifigoteborg.se/pdf/Cerwin-Vega_speakers.pdf"
    },
    {
      "model": "Cerwin-Vega D-7",
      "values": {
        "sensitivity": 98,
        "basis": "power",
        "load": 8
      },
      "note": "12-inch three-way. The original D-Series brochure lists 98 dB at 1 W / 3.28 ft and 8 Ω nominal.",
      "url": "https://hifigoteborg.se/pdf/Cerwin-Vega_speakers.pdf"
    },
    {
      "model": "Cerwin-Vega D-9",
      "values": {
        "sensitivity": 101,
        "basis": "power",
        "load": 8
      },
      "note": "15-inch three-way. The original D-Series brochure lists 101 dB at 1 W / 3.28 ft and 8 Ω nominal.",
      "url": "https://hifigoteborg.se/pdf/Cerwin-Vega_speakers.pdf"
    },
    {
      "model": "Cerwin-Vega XLS-12",
      "values": {
        "sensitivity": 90.8,
        "basis": "power",
        "load": 6
      },
      "note": "12-inch tower. Sensitivity is for one speaker at 1 W / 3.28 ft.",
      "url": "https://cerwinvega.com/products/xls-12"
    },
    {
      "model": "Cerwin-Vega XLS-15",
      "values": {
        "sensitivity": 92.3,
        "basis": "power",
        "load": 6
      },
      "note": "15-inch tower. Sensitivity is for one speaker at 1 W / 3.28 ft.",
      "url": "https://cerwinvega.com/products/xls-15"
    },
    {
      "model": "Cerwin-Vega XLS-215",
      "values": {
        "sensitivity": 95.3,
        "basis": "power",
        "load": 6
      },
      "note": "Dual 15-inch tower. Sensitivity is for one speaker at 1 W / 3.28 ft.",
      "url": "https://cerwinvega.com/products/xls-215"
    },
    {
      "model": "DALI Oberon 1",
      "values": {
        "sensitivity": 86,
        "basis": "voltage",
        "load": 6
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft.",
      "url": "https://www.dali-speakers.com/media/5320/oberon-manual.pdf"
    },
    {
      "model": "DALI Oberon 3",
      "values": {
        "sensitivity": 87,
        "basis": "voltage",
        "load": 6
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft.",
      "url": "https://www.dali-speakers.com/media/5320/oberon-manual.pdf"
    },
    {
      "model": "DALI Oberon 5",
      "values": {
        "sensitivity": 88,
        "basis": "voltage",
        "load": 6
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft.",
      "url": "https://www.dali-speakers.com/media/5320/oberon-manual.pdf"
    },
    {
      "model": "DALI Oberon 7",
      "values": {
        "sensitivity": 88.5,
        "basis": "voltage",
        "load": 6
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft.",
      "url": "https://www.dali-speakers.com/media/5320/oberon-manual.pdf"
    },
    {
      "model": "ELAC Debut 2.0 B5.2",
      "values": {
        "sensitivity": 86,
        "basis": "voltage",
        "load": 6
      },
      "note": "The sensitivity figure is for one speaker at 2.83 V / 3.28 ft.",
      "url": "https://elac.com/download/dc62/owners-manual_1.0.0.pdf"
    },
    {
      "model": "ELAC Debut 2.0 B6.2",
      "values": {
        "sensitivity": 87,
        "basis": "voltage",
        "load": 6
      },
      "note": "The sensitivity figure is for one speaker at 2.83 V / 3.28 ft.",
      "url": "https://elac.com/download/dc62/owners-manual_1.0.0.pdf"
    },
    {
      "model": "ELAC Debut 3.0 DB53",
      "values": {
        "sensitivity": 86.5,
        "basis": "voltage",
        "load": 6,
        "minimum": 4.8,
        "minimumHz": 200
      },
      "note": "The sensitivity figure is for one speaker at 2.83 V / 3.28 ft. ELAC lists a 4.8 Ω minimum at 200 Hz.",
      "url": "https://1www.elac.com/download/debut-3-0/debut-3-0-sales-sheet_2.0.0.pdf"
    },
    {
      "model": "ELAC Debut 3.0 DB63",
      "values": {
        "sensitivity": 87,
        "basis": "voltage",
        "load": 6,
        "minimum": 4.8,
        "minimumHz": 200
      },
      "note": "The sensitivity figure is for one speaker at 2.83 V / 3.28 ft. ELAC lists a 4.8 Ω minimum at 200 Hz.",
      "url": "https://1www.elac.com/download/debut-3-0/debut-3-0-sales-sheet_2.0.0.pdf"
    },
    {
      "model": "ELAC Debut 3.0 DF63",
      "values": {
        "sensitivity": 87.5,
        "basis": "voltage",
        "load": 4,
        "minimum": 3.6,
        "minimumHz": 500
      },
      "note": "The sensitivity figure is for one speaker at 2.83 V / 3.28 ft. ELAC’s sales sheet lists 4 Ω nominal and a 3.6 Ω minimum at 500 Hz.",
      "url": "https://1www.elac.com/download/debut-3-0/debut-3-0-sales-sheet_2.0.0.pdf"
    },
    {
      "model": "ELAC Debut Reference DBR62",
      "values": {
        "sensitivity": 86,
        "basis": "voltage",
        "load": 6
      },
      "note": "The sensitivity figure is for one speaker at 2.83 V / 3.28 ft.",
      "url": "https://elac.com/download/dbr62/debut-reference-bda-eng-deu-13022020.pdf"
    },
    {
      "model": "ELAC Debut Reference DFR52",
      "values": {
        "sensitivity": 87,
        "basis": "voltage",
        "load": 6
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft.",
      "url": "https://www.elac.com/download/dfr52/elac-debut-reference-eng.pdf"
    },
    {
      "model": "ELAC Uni-Fi 2.0 UB52",
      "values": {
        "sensitivity": 85,
        "basis": "voltage",
        "load": 6
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft. This preset is for the Uni-Fi 2.0 UB52.",
      "url": "https://online.elac.com/download/ub52/elac-uni-fi-2-0-en.pdf"
    },
    {
      "model": "JBL L100 Century (original)",
      "values": {
        "sensitivity": 91.2,
        "basis": "power",
        "load": 8
      },
      "note": "JBL lists 78 dB at 1 W / 15 ft. The 91.2 dB preset is an estimate at 3.28 ft using free-field distance loss.",
      "url": "https://support.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw06bf89c3/pdfs/L100%20CENTURY%5EJBL%5Eom%5E%5E%5E%5E.pdf"
    },
    {
      "model": "JBL L100 Classic",
      "values": {
        "sensitivity": 90,
        "basis": "voltage",
        "load": 4
      },
      "note": "This preset is for the L100 Classic. Sensitivity is for one speaker at 2.83 V / 3.28 ft.",
      "url": "https://ca.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw34a5166a/pdfs/JBL_Synthesis_L100_Classic_Brochure.pdf"
    },
    {
      "model": "JBL Stage 250B",
      "values": {
        "sensitivity": 86,
        "basis": "voltage",
        "load": 6
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft. This is the Stage 2 model.",
      "url": "https://www.jbl.com/250B.html"
    },
    {
      "model": "JBL Stage 280F",
      "values": {
        "sensitivity": 91,
        "basis": "voltage",
        "load": 6
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft.",
      "url": "https://global.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw9bd72c8c/pdfs/Spec%20Sheet%20-%20JBL%20280F.pdf"
    },
    {
      "model": "JBL Stage A130",
      "values": {
        "sensitivity": 86,
        "basis": "voltage",
        "load": 6
      },
      "note": "The sensitivity figure is for one speaker at 2.83 V / 3.28 ft.",
      "url": "https://ca.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw7e9d0d59/pdfs/JBL_Arena_Stage_Spec_Sheet_English%20-%20Update%2020241114.pdf"
    },
    {
      "model": "KEF LS50 Meta",
      "values": {
        "sensitivity": 85,
        "basis": "voltage",
        "load": 8,
        "minimum": 3.5
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft. KEF specifies a 3.5 Ω minimum.",
      "url": "https://ca.kef.com/products/ls50-meta"
    },
    {
      "model": "KEF Q1 Meta",
      "values": {
        "sensitivity": 86,
        "basis": "voltage",
        "load": 4,
        "minimum": 3.2
      },
      "note": "The sensitivity figure is for one speaker at 2.83 V / 3.28 ft. KEF lists a 3.2 Ω minimum.",
      "url": "https://ca.kef.com/products/q1-meta"
    },
    {
      "model": "KEF Q3 Meta",
      "values": {
        "sensitivity": 87,
        "basis": "voltage",
        "load": 4,
        "minimum": 3.2
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft. KEF specifies a 3.2 Ω minimum.",
      "url": "https://ca.kef.com/products/q3-meta"
    },
    {
      "model": "KEF Q7 Meta",
      "values": {
        "sensitivity": 87,
        "basis": "voltage",
        "load": 4,
        "minimum": 3.2
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft. KEF lists 4 Ω nominal and a 3.2 Ω minimum.",
      "url": "https://ca.kef.com/products/q7-meta"
    },
    {
      "model": "KEF Q150",
      "values": {
        "sensitivity": 86,
        "basis": "voltage",
        "load": 8,
        "minimum": 3.7
      },
      "note": "The sensitivity figure is for one speaker at 2.83 V / 3.28 ft. KEF lists a 3.7 Ω minimum.",
      "url": "https://au.kef.com/products/q150-bookshelf-speaker"
    },
    {
      "model": "KEF Q350",
      "values": {
        "sensitivity": 87,
        "basis": "voltage",
        "load": 8,
        "minimum": 3.7
      },
      "note": "The sensitivity figure is for one speaker at 2.83 V / 3.28 ft. KEF lists a 3.7 Ω minimum.",
      "url": "https://international.kef.com/products/q350-bookshelf-speaker/1000"
    },
    {
      "model": "KEF Q550",
      "values": {
        "sensitivity": 87,
        "basis": "voltage",
        "load": 8,
        "minimum": 3.5
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft. KEF lists 8 Ω nominal and a 3.5 Ω minimum.",
      "url": "https://assets.kef.com/uploads/cm/Q_Series_Manual_EN.pdf"
    },
    {
      "model": "KEF Q750",
      "values": {
        "sensitivity": 88,
        "basis": "voltage",
        "load": 8,
        "minimum": 3.8
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft. KEF lists 8 Ω nominal and a 3.8 Ω minimum.",
      "url": "https://assets.kef.com/uploads/cm/Q_Series_Manual_EN.pdf"
    },
    {
      "model": "KEF Q950",
      "values": {
        "sensitivity": 91,
        "basis": "voltage",
        "load": 8,
        "minimum": 3.2
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft. KEF lists 8 Ω nominal and a 3.2 Ω minimum.",
      "url": "https://assets.kef.com/uploads/cm/Q_Series_Manual_EN.pdf"
    },
    {
      "model": "Klipsch Forte II",
      "values": {
        "sensitivity": 99,
        "basis": "power",
        "load": 8
      },
      "note": "Original Forte II brochure. Sensitivity is for one speaker at 1 W / 3.28 ft.",
      "url": "https://assets.klipsch.com/product-specsheets/forte-II-brochure.pdf"
    },
    {
      "model": "Klipsch Heresy II",
      "values": {
        "sensitivity": 96,
        "basis": "power",
        "load": 8
      },
      "note": "Original Heresy II brochure. Sensitivity is for one speaker at 1 W / 3.28 ft.",
      "url": "https://assets.klipsch.com/files/Heresy-II-La-Scala-Belle-Klipsch-brochure-and-specs.pdf"
    },
    {
      "model": "Klipsch R-50M",
      "values": {
        "sensitivity": 92,
        "basis": "voltage",
        "load": 8
      },
      "note": "Klipsch’s 92 dB figure uses its room-referenced convention. The preset uses 8 Ω compatibility as a calculation reference. Leave room adjustment at zero to avoid counting room contribution twice.",
      "url": "https://assets.klipsch.com/product-specsheets/Reference-R-50M-Spec-Sheet.pdf"
    },
    {
      "model": "Klipsch R-51M",
      "values": {
        "sensitivity": 93,
        "basis": "voltage",
        "load": 8
      },
      "note": "Manufacturer sensitivity and 8 Ω compatibility reference. Use an independent free-field sensitivity measurement if available.",
      "url": "https://assets.klipsch.com/product-specsheets/R-51M_Spec-Sheet_v01.pdf"
    },
    {
      "model": "Klipsch RP-600M (original)",
      "values": {
        "sensitivity": 89.6,
        "basis": "voltage",
        "load": 8,
        "minimum": 3.5
      },
      "note": "Uses Stereophile’s 89.6 dB(B) sensitivity estimate and 3.5 Ω minimum, measured between 180 and 220 Hz. The 8 Ω entry is Klipsch’s compatibility reference.",
      "url": "https://www.stereophile.com/content/klipsch-reference-premiere-rp-600m-loudspeaker-measurements",
      "extra": [
        "Klipsch specifications",
        "https://www.erinsaudiocorner.com/loudspeakers/klipsch_rp_600m/"
      ]
    },
    {
      "model": "Klipsch RP-600M II",
      "values": {
        "sensitivity": 86,
        "basis": "voltage",
        "load": 8
      },
      "note": "Uses the 86 dB average from Erin’s Audio Corner’s free-field data as reported by Spinorama. Klipsch publishes 94.5 dB under its room-referenced convention and lists 8 Ω compatibility.",
      "url": "https://www.spinorama.org/speakers/Klipsch%20RP-600M%20II/ErinsAudioCorner/index_eac-no-grille.html",
      "extra": [
        "Klipsch spec sheet",
        "https://assets.klipsch.com/product-specsheets/RP-600M-II_Spec-Sheet_v02.pdf"
      ]
    },
    {
      "model": "Klipsch RP-8000F II",
      "values": {
        "sensitivity": 91.7,
        "basis": "voltage",
        "load": 8
      },
      "note": "Uses the 91.7 dB average from Erin’s Audio Corner’s free-field data as reported by Spinorama. Klipsch publishes 98 dB under its room-referenced convention and lists 8 Ω compatibility.",
      "url": "https://www.spinorama.org/speakers/Klipsch%20RP-8000F%20II/ErinsAudioCorner/index_eac.html",
      "extra": [
        "Klipsch spec sheet",
        "https://assets.klipsch.com/product-specsheets/RP-8000F-II_Spec-Sheet_v02.pdf"
      ]
    },
    {
      "model": "Paradigm Monitor SE 6000F",
      "values": {
        "sensitivity": 90,
        "basis": "voltage",
        "load": 8
      },
      "note": "Uses the 90 dB anechoic figure so you can apply your own room adjustment. Paradigm also lists 93 dB in-room and 8 Ω compatibility.",
      "url": "https://www.paradigm.com/en/floorstanding/monitor-se-6000f"
    },
    {
      "model": "Paradigm Monitor SE Atom",
      "values": {
        "sensitivity": 86,
        "basis": "voltage",
        "load": 8
      },
      "note": "Uses the 86 dB anechoic figure. Paradigm also publishes 89 dB in-room and lists 8 Ω compatibility.",
      "url": "https://www.paradigm.com/en/passive/monitor-se-atom"
    },
    {
      "model": "Paradigm Phantom v1",
      "values": {
        "sensitivity": 87,
        "basis": "voltage",
        "load": 8
      },
      "note": "87 dB anechoic (90 dB in room) and 8 Ω compatibility, from a reproduced v1 specification. The calculator assumes the 2.83 V / 3.28 ft basis. Minimum impedance is unverified.",
      "url": "https://www.canuckaudiomart.com/details/649848571-paradigm-phantom-v1-speakers/"
    },
    {
      "model": "Paradigm Titan v3",
      "values": {
        "sensitivity": 86,
        "basis": "voltage",
        "load": 8
      },
      "note": "86 dB anechoic (89 dB in room) and 8 Ω compatibility, from a secondary v3 specification. The calculator assumes the 2.83 V / 3.28 ft basis. Minimum impedance is unverified.",
      "url": "https://www.canuckaudiomart.com/details/649350799-paradigm-titan-bookshelf-speakers-v3-black-with-wall-mounts/"
    },
    {
      "model": "Pioneer HPM-100",
      "values": {
        "sensitivity": 92,
        "basis": "voltage",
        "load": 8
      },
      "note": "Sensitivity is the period Hi-Fi Choice measurement at 2.83 V / 3.28 ft. The original nominal rating is 8 Ω.",
      "url": "https://www.worldradiohistory.com/UK/Hi-Fi-Choice/1975-1982/Hi-Fi%20Choice%20Iss.%20010%20Loudspeakers%201978.pdf",
      "extra": [
        "HPM-100 specifications and manuals",
        "https://www.hifiengine.com/manual_library/pioneer/hpm-100.shtml"
      ]
    },
    {
      "model": "Pioneer S-H352F-K",
      "values": {
        "sensitivity": 89,
        "basis": "voltage"
      },
      "note": "89 dB at 2.83 V / 3.28 ft, from archived model-specific product specs. Enter the nominal impedance from the cabinet label. The published maximum of 109 dB has no stated measurement distance here.",
      "url": "https://www.generalmanual.com/Speaker/Pioneer-S-H352F-K-3-Way-Floor-Standing-Speaker.htm"
    },
    {
      "model": "Polk Reserve R200",
      "values": {
        "sensitivity": 86,
        "basis": "voltage",
        "load": 8,
        "minimum": 3.8
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft. Polk lists 8, 6 and 4 Ω amplifier output compatibility and a 3.8 Ω minimum. The preset uses 8 Ω as a calculation reference.",
      "url": "https://www.polkaudio.com/on/demandware.static/-/Library-Sites-polk_northamerica_shared/default/dw4c6aec6a/downloads/reserve-r200ae-owners-manual-global.pdf"
    },
    {
      "model": "Polk Signature Elite ES15",
      "values": {
        "sensitivity": 85,
        "basis": "voltage",
        "load": 8
      },
      "note": "The sensitivity figure is for one speaker at 2.83 V / 3.28 ft. Polk specifies 4 Ω and 8 Ω amp compatibility. The 8 Ω entry is a calculation reference.",
      "url": "https://www.polkaudio.com/on/demandware.static/-/Library-Sites-polk_northamerica_shared/default/dwf6e3c837/downloads/Polk_Infosheet_ES15-ES20_759558.pdf"
    },
    {
      "model": "Polk Signature Elite ES20",
      "values": {
        "sensitivity": 86,
        "basis": "voltage",
        "load": 8
      },
      "note": "The sensitivity figure is for one speaker at 2.83 V / 3.28 ft. Polk specifies 4 Ω and 8 Ω amp compatibility. The 8 Ω entry is a calculation reference.",
      "url": "https://www.polkaudio.com/on/demandware.static/-/Library-Sites-polk_northamerica_shared/default/dwf6e3c837/downloads/Polk_Infosheet_ES15-ES20_759558.pdf"
    },
    {
      "model": "Polk Signature Elite ES60",
      "values": {
        "sensitivity": 90,
        "basis": "voltage",
        "load": 8
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft. Polk lists compatibility with 4 Ω and 8 Ω amplifier outputs. The preset uses 8 Ω as a calculation reference.",
      "url": "https://www.polkaudio.com/on/demandware.static/-/Library-Sites-polk_northamerica_shared/default/dw08b8483e/downloads/Polk_Infosheet_ES50-ES55-ES60_759558.pdf"
    },
    {
      "model": "Q Acoustics 3020i",
      "values": {
        "sensitivity": 88,
        "basis": "voltage",
        "load": 6,
        "minimum": 4
      },
      "note": "The sensitivity figure is for one speaker at 2.83 V / 3.28 ft. Q Acoustics lists a 4 Ω minimum.",
      "url": "https://www.qacoustics.com/products/3020i-bookshelf-speaker-pair"
    },
    {
      "model": "Sony SS-CS5 (original)",
      "values": {
        "sensitivity": 87,
        "basis": "voltage",
        "load": 6
      },
      "note": "The sensitivity figure is for one speaker at 2.83 V / 3.28 ft. This preset is for the original SS-CS5.",
      "url": "https://www.sony.ca/en/electronics/support/speakers-wired-speakers/ss-cs5/specifications"
    },
    {
      "model": "Wharfedale Diamond 12.1",
      "values": {
        "sensitivity": 88,
        "basis": "voltage",
        "load": 8,
        "minimum": 4
      },
      "note": "The sensitivity figure is for one speaker at 2.83 V / 3.28 ft. Wharfedale lists 8 Ω compatibility and a 4 Ω minimum.",
      "url": "https://www.wharfedale.co.uk/collections/diamond-12-series/products/diamond-12-1"
    },
    {
      "model": "Wharfedale Diamond 12.2",
      "values": {
        "sensitivity": 88,
        "basis": "voltage",
        "load": 8,
        "minimum": 4
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft. Wharfedale lists 8 Ω compatibility and a 4 Ω minimum.",
      "url": "https://www.wharfedale.co.uk/collections/diamond-12-series/products/diamond-12-2"
    },
    {
      "model": "Wharfedale Diamond 12.3",
      "values": {
        "sensitivity": 89,
        "basis": "voltage",
        "load": 8,
        "minimum": 5
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft. Wharfedale lists 8 Ω compatibility and a 5 Ω minimum.",
      "url": "https://www.wharfedale.co.uk/collections/diamond-12-series/products/diamond-12-3"
    },
    {
      "model": "Yamaha NS-555",
      "values": {
        "sensitivity": 88,
        "basis": "voltage",
        "load": 6
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft.",
      "url": "https://ca.yamaha.com/en/audio/home-audio/products/speakers/ns-555/specs.html"
    },
    {
      "model": "Yamaha NS-777",
      "values": {
        "sensitivity": 89,
        "basis": "voltage",
        "load": 6
      },
      "note": "Sensitivity is for one speaker at 2.83 V / 3.28 ft.",
      "url": "https://ca.yamaha.com/en/audio/home-audio/products/speakers/ns-777/specs.html"
    },
    {
      "model": "Yamaha NS-1000M",
      "values": {
        "sensitivity": 90,
        "basis": "voltage",
        "load": 8
      },
      "note": "Hi-Fi Choice measured 90 dB at 2.83 V / 3.28 ft. Yamaha's owner's manual lists 8 Ω nominal.",
      "url": "https://www.worldradiohistory.com/UK/Hi-Fi-Choice/1975-1982/Hi-Fi%20Choice%20Iss.%20015%20Loudspeakers%203%201979.pdf",
      "extra": [
        "Yamaha owner's manual",
        "https://medias.audiofanzine.com/files/yamaha-ns-1000-owners-manual-480506.pdf"
      ]
    },
    {
      "model": "Yamaha NS-6490 (Canada)",
      "values": {
        "sensitivity": 90,
        "basis": "voltage",
        "load": 6
      },
      "note": "Yamaha Canada's three-way sealed model specifications. Sensitivity is for one speaker at 2.83 V / 3.28 ft.",
      "url": "https://ca.yamaha.com/en/audio/home-audio/products/speakers/ns-6490/"
    }
  ],
  "amp": [
    {
      "model": "Cambridge Audio AXA35",
      "values": {
        "inputZ": 47
      },
      "ratings": [
        [
          35,
          8,
          "continuous",
          "Manufacturer rated power; published THD applies at 80% of rated power"
        ]
      ],
      "note": "Published 8 Ω power and line input impedance. The manual gives a separate distortion figure at 80% of rated output.",
      "url": "https://manuals.cambridgeaudio.com/sites/default/files/manuals/axa35_a4_en.pdf"
    },
    {
      "model": "Cambridge Audio AXR100D",
      "values": {
        "inputZ": 47
      },
      "ratings": [
        [
          100,
          8,
          "continuous",
          "Manufacturer rated output; published THD applies at 80% of rated power"
        ]
      ],
      "note": "Published 8 Ω power and 47 kΩ line input impedance for the DAB-equipped AXR100D.",
      "url": "https://manuals.cambridgeaudio.com/sites/default/files/manuals/axr100d_a4_en.pdf"
    },
    {
      "model": "Cambridge Audio CXA61",
      "values": {
        "inputZ": 43
      },
      "ratings": [
        [
          60,
          8,
          "continuous",
          "Manufacturer RMS rating"
        ],
        [
          90,
          4,
          "continuous",
          "Manufacturer RMS rating"
        ]
      ],
      "note": "Cambridge specifies 60 W into 8 Ω and 90 W into 4 Ω. Its published distortion tests use separate conditions.",
      "url": "https://manuals.cambridgeaudio.com/sites/default/files/manuals/cxa61_81_81_mk_ii_a4_en.pdf"
    },
    {
      "model": "Cambridge Audio CXA81",
      "values": {
        "inputZ": 43
      },
      "ratings": [
        [
          80,
          8,
          "continuous",
          "Manufacturer RMS rating"
        ],
        [
          120,
          4,
          "continuous",
          "Manufacturer RMS rating"
        ]
      ],
      "note": "Original CXA81. Cambridge publishes RMS power into both loads and gives the unbalanced input impedance.",
      "url": "https://manuals.cambridgeaudio.com/sites/default/files/manuals/cxa61_81_81_mk_ii_a4_en.pdf"
    },
    {
      "model": "Cambridge Audio CXA81 Mk II",
      "values": {
        "inputZ": 43
      },
      "ratings": [
        [
          80,
          8,
          "continuous",
          "Manufacturer RMS rating"
        ],
        [
          120,
          4,
          "continuous",
          "Manufacturer RMS rating"
        ]
      ],
      "note": "CXA81 Mk II. Cambridge publishes RMS power into both loads and gives the unbalanced input impedance.",
      "url": "https://manuals.cambridgeaudio.com/sites/default/files/manuals/cxa61_81_81_mk_ii_a4_en.pdf"
    },
    {
      "model": "Denon AVR-S760H",
      "values": {},
      "ratings": [
        [
          75,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.08% THD, front channels"
        ],
        [
          110,
          6,
          "continuous",
          "1 kHz, 0.7% THD, front channels"
        ]
      ],
      "note": "Front-channel ratings. Power with all surround channels driven can differ.",
      "url": "https://manuals.denon.com/avrs760h/na/en/GFNFSYbsjxinov.php"
    },
    {
      "model": "Denon AVR-X1700H",
      "values": {},
      "ratings": [
        [
          80,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.08% THD, front channels"
        ],
        [
          120,
          6,
          "continuous",
          "1 kHz, 0.7% THD, front channels"
        ]
      ],
      "note": "Front-channel ratings from Denon’s manual. Power with all surround channels driven can differ.",
      "url": "https://manuals.denon.com/AVRX1700H/eu/en/GFNFSYbsjxinov.php"
    },
    {
      "model": "Denon AVR-X1800H",
      "values": {},
      "ratings": [
        [
          80,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.08% THD, front channels"
        ],
        [
          120,
          6,
          "continuous",
          "1 kHz, 0.7% THD, front channels"
        ]
      ],
      "note": "North American front-channel ratings. Output with all surround channels driven can differ.",
      "url": "https://manuals.denon.com/AVRX1800H/NA/en/DRDZSYifoqoect.php"
    },
    {
      "model": "Denon DRA-900H",
      "values": {},
      "ratings": [
        [
          100,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.08% THD, 2 channels driven"
        ],
        [
          120,
          6,
          "continuous",
          "1 kHz, 0.7% THD, 2 channels driven"
        ]
      ],
      "note": "The 8 Ω rating covers the audible band. The 6 Ω rating uses a single test tone and permits more distortion.",
      "url": "https://www.denon.com/en/product/av-receivers/dra-900h/DRA900H.html"
    },
    {
      "model": "Denon PMA-500V",
      "values": {
        "inputZ": 47,
        "inputSensitivity": 0.15
      },
      "ratings": [
        [
          80,
          8,
          "continuous",
          "20 Hz–20 kHz, <0.05% THD, both channels driven"
        ],
        [
          130,
          4,
          "continuous",
          "1 kHz, 1% THD, DIN"
        ]
      ],
      "note": "Denon lists 80 W per channel into 8 Ω across the audio band. The 130 W figure into 4 Ω is a 1 kHz DIN rating at 1% THD. The line input is rated at 150 mV and 47 kΩ.",
      "url": "https://www.manualslib.com/manual/4265572/Denon-Pma-500v.html?page=17"
    },
    {
      "model": "Denon PMA-600NE",
      "values": {
        "inputZ": 40
      },
      "ratings": [
        [
          45,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.07% THD, both channels driven"
        ],
        [
          70,
          4,
          "continuous",
          "1 kHz, 0.7% THD, both channels driven"
        ]
      ],
      "note": "The 4 Ω rating uses a single test frequency and higher distortion limit. Line input impedance is 40 kΩ with Source Direct off and 17 kΩ with it on.",
      "url": "https://manuals.denon.com/pma600ne/na/en/OBAOSYxljoeltq.php"
    },
    {
      "model": "Denon PMA-900HNE",
      "values": {
        "inputZ": 17
      },
      "ratings": [
        [
          50,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.07% THD, 2 channels driven"
        ],
        [
          85,
          4,
          "continuous",
          "1 kHz, 0.7% THD, 2 channels driven"
        ]
      ],
      "note": "Line input impedance is 17 kΩ. The 4 Ω rating uses a single test frequency and a higher distortion limit.",
      "url": "https://manuals.denon.com/pma900hne/eu/en/obaosyqihmfszx.php"
    },
    {
      "model": "Marantz 2230",
      "values": {},
      "ratings": [
        [
          30,
          8,
          "continuous",
          "Rated continuous, both channels driven"
        ],
        [
          30,
          4,
          "continuous",
          "Rated continuous, both channels driven"
        ]
      ],
      "note": "Original 2230 receiver. The service manual gives 30 W per channel with both channels driven into either 8 Ω or 4 Ω.",
      "url": "https://library.mikesservers.com/M/Marantz/2230/marantz_2230_receiver_sm.pdf"
    },
    {
      "model": "Marantz 2270",
      "values": {},
      "ratings": [
        [
          70,
          8,
          "continuous",
          "20 Hz–20 kHz, both channels driven"
        ],
        [
          70,
          4,
          "continuous",
          "20 Hz–20 kHz, both channels driven"
        ]
      ],
      "note": "Original 2270 receiver. The owner's manual lists full-band continuous power into 4 Ω and 8 Ω.",
      "url": "https://retronik.silicium.org/DOCUMENTS/Audiovideo/Marantz/Marantz-2270-Owners-Manual.pdf"
    },
    {
      "model": "Marantz PM6007",
      "values": {
        "inputZ": 20,
        "outputZ": 0.08
      },
      "ratings": [
        [
          45,
          8,
          "continuous",
          "20 Hz–20 kHz, both channels driven; 0.08% THD listed at 8 Ω"
        ],
        [
          60,
          4,
          "continuous",
          "20 Hz–20 kHz, both channels driven; 4 Ω THD not listed"
        ]
      ],
      "note": "The manual gives a damping factor of 100 into 8 Ω, corresponding to an estimated 0.08 Ω output impedance.",
      "url": "https://manuals.marantz.com/pm6007/na/en/DNTXSYnslltjoe.php"
    },
    {
      "model": "Marantz Stereo 70s",
      "values": {},
      "ratings": [
        [
          75,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.08% THD, 2 channels driven"
        ],
        [
          100,
          6,
          "continuous",
          "1 kHz, 0.7% THD, 2 channels driven"
        ]
      ],
      "note": "The 8 Ω rating covers the audible band. The 6 Ω rating uses a single test tone and permits more distortion.",
      "url": "https://manuals.marantz.com/stereo70s/NA/EN/DRDZSYifoqoect.php"
    },
    {
      "model": "NAD 3020 (original)",
      "values": {
        "inputZ": 20,
        "inputSensitivity": 0.15
      },
      "ratings": [
        [
          20,
          8,
          "continuous",
          "20 Hz–20 kHz, both channels driven"
        ],
        [
          39,
          8,
          "burst",
          "Manufacturer dynamic rating"
        ],
        [
          58,
          4,
          "burst",
          "Manufacturer dynamic rating"
        ]
      ],
      "note": "Original 3020 integrated amp. The manual gives 20 W per channel continuous, separate short-burst ratings, and 0.15 V line input sensitivity at 20 W.",
      "url": "https://audiocircuit.dk/downloads/nad/NAD-3020-int-sm2.pdf"
    },
    {
      "model": "NAD C 316BEE V2",
      "values": {},
      "ratings": [
        [
          40,
          8,
          "continuous",
          "20 Hz–20 kHz, <0.03% THD, both channels driven"
        ],
        [
          40,
          4,
          "continuous",
          "20 Hz–20 kHz, <0.03% THD, both channels driven"
        ],
        [
          90,
          8,
          "burst",
          "IHF dynamic power"
        ],
        [
          120,
          4,
          "burst",
          "IHF dynamic power"
        ]
      ],
      "note": "NAD specifies the same continuous output into 8 Ω and 4 Ω, with separate IHF dynamic ratings.",
      "url": "https://nadelectronics.com/wp1.nadelectronics.com/wp-content/uploads/2018/05/NAD_C316BEEV2_Data_Sheet.pdf"
    },
    {
      "model": "Onkyo TX-8220",
      "values": {},
      "ratings": [
        [
          45,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.08% THD, 2 channels driven"
        ],
        [
          80,
          8,
          "burst",
          "Onkyo dynamic power, front"
        ],
        [
          120,
          4,
          "burst",
          "Onkyo dynamic power, front"
        ]
      ],
      "note": "Uses the full-band 8 Ω rating and the 8 Ω and 4 Ω dynamic ratings. Onkyo’s page gives conflicting THD conditions for its 6 Ω rating.",
      "url": "https://onkyo.com/emea/home-audio/tx-8220"
    },
    {
      "model": "Panasonic SA-HE100",
      "values": {
        "inputZ": 22,
        "outputZ": 0.2
      },
      "ratings": [
        [
          100,
          6,
          "continuous",
          "40 Hz–20 kHz, 0.9% THD, both channels driven"
        ],
        [
          105,
          6,
          "continuous",
          "1 kHz, 0.05% THD, both channels driven"
        ]
      ],
      "note": "Front stereo ratings. Approx. 0.2 Ω speaker output impedance is derived from the low-frequency damping factor. The manual gives line-input sensitivity under IHF conditions, so rated-output sensitivity is left blank.",
      "url": "https://help.na.panasonic.com/wp-content/uploads/2023/02/SAHE100_RQT6209_ENG.pdf"
    },
    {
      "model": "Pioneer SX-780",
      "values": {},
      "ratings": [
        [
          45,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.05% THD, both channels driven"
        ]
      ],
      "note": "Original SX-780 receiver. The 45 W per channel rating is the full-band stereo figure.",
      "url": "https://www.manualslib.com/manual/4050022/Pioneer-Sx-780.html"
    },
    {
      "model": "Pioneer SX-950",
      "values": {},
      "ratings": [
        [
          85,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.1% THD, both channels driven"
        ]
      ],
      "note": "Original SX-950 receiver. Pioneer's period catalogue lists the 85 W full-band stereo rating.",
      "url": "https://hifigoteborg.se/pdf/Pioneer_1976-77.pdf"
    },
    {
      "model": "Sansui AU-517",
      "values": {
        "inputZ": 47,
        "inputSensitivity": 0.15
      },
      "ratings": [
        [
          65,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.025% THD, both channels driven"
        ]
      ],
      "note": "Original AU-517 integrated amp. AUX input sensitivity is specified at rated power with a 1 kHz signal.",
      "url": "https://www.hifiengine.info/sansui/sansui_au-517_717s.pdf"
    },
    {
      "model": "Sansui AU-717",
      "values": {
        "inputZ": 47,
        "inputSensitivity": 0.15
      },
      "ratings": [
        [
          85,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.025% THD, both channels driven"
        ]
      ],
      "note": "Original AU-717 integrated amp. AUX input sensitivity is specified at rated power with a 1 kHz signal.",
      "url": "https://www.hifiengine.info/sansui/sansui_au-517_717s.pdf"
    },
    {
      "model": "Sony STR-DE475 (US/Canada)",
      "values": {
        "inputZ": 50
      },
      "ratings": [
        [
          80,
          8,
          "continuous",
          "40 Hz–20 kHz, 0.09% THD, both channels driven"
        ]
      ],
      "note": "North American stereo rating. Line input is specified at 50 kΩ.",
      "url": "https://www.manualslib.com/manual/471231/Sony-Str-De475-Fm-Stereo-Fm-Am-Receiver.html"
    },
    {
      "model": "Sony STR-DH190",
      "values": {},
      "ratings": [
        [
          90,
          8,
          "continuous",
          "20 Hz–20 kHz, ≤0.09% THD, both channels driven"
        ]
      ],
      "note": "The US service manual lists 90 W per channel for the full audio band. Sony’s product page lists 100 W at 1 kHz and 1% THD. Sony specifies 6–16 Ω speakers.",
      "url": "https://research.encompass.com/SON/rr/STRDH190.pdf",
      "extra": [
        "Sony product specifications",
        "https://www.sony.ca/en/electronics/support/audio-components-receivers-amplifiers/str-dh190/specifications"
      ]
    },
    {
      "model": "Sony STR-DH590",
      "values": {},
      "ratings": [
        [
          90,
          6,
          "continuous",
          "20 Hz–20 kHz, ≤0.09% THD, both channels driven"
        ]
      ],
      "note": "Uses Sony’s full-band stereo rating. The product-page 145 W figure is a one-channel, 1 kHz test.",
      "url": "https://assets.worldwidestereo.com/documents/170575/Sony-STR-DH590-Manual.pdf"
    },
    {
      "model": "WiiM Amp",
      "values": {},
      "ratings": [
        [
          64,
          8,
          "continuous",
          "Hi-Fi News lab output, below 1% THD"
        ],
        [
          125,
          4,
          "continuous",
          "Hi-Fi News lab output, below 1% THD"
        ],
        [
          59,
          8,
          "burst",
          "Hi-Fi News dynamic lab output, below 1% THD"
        ],
        [
          110,
          4,
          "burst",
          "Hi-Fi News dynamic lab output, below 1% THD"
        ]
      ],
      "note": "Uses Hi-Fi News bench results. The lab reports standard output separately from dynamic output. WiiM lists 60 W at 8 Ω and 120 W at 4 Ω. Output impedance varies with frequency in the lab test.",
      "url": "https://www.hifinews.com/content/wiim-amp-lab-report",
      "extra": [
        "WiiM manufacturer specifications",
        "https://faq.wiimhome.com/en/support/solutions/articles/72000616467-technical-specification-of-the-wiim-amp"
      ]
    },
    {
      "model": "Yamaha A-720",
      "values": {
        "inputZ": 47,
        "inputSensitivity": 0.15,
        "outputZ": 0.178
      },
      "ratings": [
        [
          105,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.005% THD"
        ],
        [
          125,
          6,
          "continuous",
          "20 Hz–20 kHz, 0.007% THD"
        ],
        [
          145,
          8,
          "burst",
          "IHF dynamic power"
        ],
        [
          180,
          6,
          "burst",
          "IHF dynamic power"
        ],
        [
          240,
          4,
          "burst",
          "IHF dynamic power"
        ]
      ],
      "note": "Factory line-input specs. Approx. 0.178 Ω speaker output impedance is derived from the 8 Ω damping factor at 1 kHz. The 150 W / 4 Ω DIN figure applies to other regional versions.",
      "url": "https://audiocircuit.dk/downloads/yamaha/Yamaha-A720-int-sm.pdf"
    },
    {
      "model": "Yamaha A-1000",
      "values": {
        "outputZ": 0.089
      },
      "ratings": [
        [
          120,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.005% THD"
        ],
        [
          140,
          6,
          "continuous",
          "20 Hz–20 kHz, 0.007% THD"
        ]
      ],
      "note": "The service manual lists full-band power into 8 Ω and 6 Ω. The output impedance estimate uses the published damping factor of 90 at 8 Ω and 1 kHz.",
      "url": "https://ks19561005.sakura.ne.jp/9999/ServiceManual/Yamaha%2CA-1000_service.pdf"
    },
    {
      "model": "Yamaha A-S301",
      "values": {
        "inputZ": 47,
        "outputZ": 0.0381
      },
      "ratings": [
        [
          60,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.019% THD"
        ],
        [
          70,
          6,
          "continuous",
          "20 Hz–20 kHz, 0.038% THD"
        ],
        [
          100,
          8,
          "burst",
          "IHF dynamic power"
        ],
        [
          120,
          6,
          "burst",
          "IHF dynamic power"
        ],
        [
          140,
          4,
          "burst",
          "IHF dynamic power"
        ]
      ],
      "note": "Minimum RMS and IHF dynamic ratings from the owner’s manual. Dynamic results at low impedances describe a bench test. The estimated output impedance comes from the 8 Ω damping factor at 1 kHz.",
      "url": "https://data.yamaha.com/files/download/other_assets/1/332211/web_VEX7890_A-S701_A-S501_A-S301_om_RL_EnEs_A0.pdf"
    },
    {
      "model": "Yamaha A-S501",
      "values": {
        "inputZ": 47,
        "outputZ": 0.0333
      },
      "ratings": [
        [
          85,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.019% THD"
        ],
        [
          100,
          6,
          "continuous",
          "20 Hz–20 kHz, 0.038% THD"
        ],
        [
          130,
          8,
          "burst",
          "IHF dynamic power"
        ],
        [
          150,
          6,
          "burst",
          "IHF dynamic power"
        ],
        [
          185,
          4,
          "burst",
          "IHF dynamic power"
        ]
      ],
      "note": "Minimum RMS and IHF dynamic ratings from the owner’s manual. Dynamic results at low impedances describe a bench test. The estimated output impedance comes from the 8 Ω damping factor at 1 kHz.",
      "url": "https://data.yamaha.com/files/download/other_assets/1/332211/web_VEX7890_A-S701_A-S501_A-S301_om_RL_EnEs_A0.pdf"
    },
    {
      "model": "Yamaha A-S701",
      "values": {
        "inputZ": 47,
        "outputZ": 0.0333
      },
      "ratings": [
        [
          100,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.019% THD"
        ],
        [
          120,
          6,
          "continuous",
          "20 Hz–20 kHz, 0.038% THD"
        ],
        [
          140,
          8,
          "burst",
          "IHF dynamic power"
        ],
        [
          170,
          6,
          "burst",
          "IHF dynamic power"
        ],
        [
          220,
          4,
          "burst",
          "IHF dynamic power"
        ]
      ],
      "note": "Minimum RMS and IHF dynamic ratings from the owner’s manual. Dynamic results at low impedances describe a bench test. The estimated output impedance comes from the 8 Ω damping factor at 1 kHz.",
      "url": "https://data.yamaha.com/files/download/other_assets/1/332211/web_VEX7890_A-S701_A-S501_A-S301_om_RL_EnEs_A0.pdf"
    },
    {
      "model": "Yamaha A-S801",
      "values": {
        "inputZ": 47,
        "outputZ": 0.0333
      },
      "ratings": [
        [
          100,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.019% THD"
        ],
        [
          120,
          6,
          "continuous",
          "20 Hz–20 kHz, 0.038% THD"
        ],
        [
          140,
          8,
          "burst",
          "IHF dynamic power"
        ],
        [
          170,
          6,
          "burst",
          "IHF dynamic power"
        ],
        [
          220,
          4,
          "burst",
          "IHF dynamic power"
        ]
      ],
      "note": "Minimum RMS and IHF dynamic ratings from the owner’s manual. Dynamic results at low impedances describe a bench test. The estimated output impedance comes from the 8 Ω damping factor at 1 kHz.",
      "url": "https://data.yamaha.com/files/download/other_assets/1/1412681/web_VEX7500_A-S801_om_U_EnFr_A0.pdf"
    },
    {
      "model": "Yamaha A-S1200",
      "values": {
        "outputZ": 0.032
      },
      "ratings": [
        [
          90,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.07% THD, stereo"
        ],
        [
          150,
          4,
          "continuous",
          "20 Hz–20 kHz, 0.07% THD, stereo"
        ]
      ],
      "note": "Yamaha’s stereo power ratings. The 0.032 Ω output impedance estimate uses the published minimum damping factor of 250 into 8 Ω at 1 kHz.",
      "url": "https://ca.yamaha.com/en/audio/home-audio/products/hifi-components/a-s1200/specs.html"
    },
    {
      "model": "Yamaha A-S3200",
      "values": {
        "outputZ": 0.032
      },
      "ratings": [
        [
          100,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.07% THD, stereo"
        ],
        [
          150,
          4,
          "continuous",
          "20 Hz–20 kHz, 0.07% THD, stereo"
        ]
      ],
      "note": "Yamaha’s stereo power ratings. The 0.032 Ω output impedance estimate uses the published minimum damping factor of 250 into 8 Ω at 1 kHz.",
      "url": "https://ca.yamaha.com/en/business/audio/products/custom-installation/a-s3200/specs.html"
    },
    {
      "model": "Yamaha HTR-4063 (US/Canada)",
      "values": {
        "inputZ": 47
      },
      "ratings": [
        [
          105,
          8,
          "continuous",
          "1 kHz, 0.9% THD, front-channel RMS rating"
        ],
        [
          110,
          8,
          "burst",
          "IHF dynamic power, front channels"
        ],
        [
          130,
          6,
          "burst",
          "IHF dynamic power, front channels"
        ],
        [
          160,
          4,
          "burst",
          "IHF dynamic power, front channels"
        ]
      ],
      "note": "North American factory ratings. IHF burst results describe the bench test. Check the manual’s speaker-connection section for supported loads.",
      "url": "https://www.manualowl.com/m/Yamaha/HTR-4063/Manual/249545?page=79",
      "extra": [
        "Line input specifications",
        "https://www.manualowl.com/m/Yamaha/HTR-4063/Manual/249545?page=80"
      ]
    },
    {
      "model": "Yamaha R-N600A",
      "values": {},
      "ratings": [
        [
          80,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.07% THD"
        ],
        [
          105,
          8,
          "burst",
          "Yamaha dynamic power per channel"
        ],
        [
          125,
          6,
          "burst",
          "Yamaha dynamic power per channel"
        ],
        [
          150,
          4,
          "burst",
          "Yamaha dynamic power per channel"
        ]
      ],
      "note": "The 80 W per channel rating is continuous. Yamaha publishes separate dynamic power ratings into 8 Ω, 6 Ω and 4 Ω.",
      "url": "https://ca.yamaha.com/en/audio/home-audio/products/hifi-components/r-n600a/specs.html"
    },
    {
      "model": "Yamaha R-N800A",
      "values": {},
      "ratings": [
        [
          100,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.07% THD"
        ],
        [
          140,
          8,
          "burst",
          "Yamaha dynamic power per channel"
        ],
        [
          170,
          6,
          "burst",
          "Yamaha dynamic power per channel"
        ],
        [
          220,
          4,
          "burst",
          "Yamaha dynamic power per channel"
        ]
      ],
      "note": "The 100 W per channel rating is continuous. Yamaha publishes separate dynamic power ratings into 8 Ω, 6 Ω and 4 Ω.",
      "url": "https://ca.yamaha.com/en/audio/home-audio/products/hifi-components/r-n800a/specs.html"
    },
    {
      "model": "Yamaha R-S202",
      "values": {
        "inputZ": 47,
        "inputSensitivity": 0.5
      },
      "ratings": [
        [
          100,
          8,
          "continuous",
          "40 Hz–20 kHz, 0.2% THD, 2 channels"
        ],
        [
          125,
          8,
          "burst",
          "Manufacturer dynamic power per channel"
        ],
        [
          150,
          6,
          "burst",
          "Manufacturer dynamic power per channel"
        ],
        [
          165,
          4,
          "burst",
          "Manufacturer dynamic power per channel"
        ]
      ],
      "note": "North American 100 W stereo rating. The owner’s manual gives a separate set of IHF dynamic figures and specifies 0.5 V input sensitivity at 100 W into 8 Ω.",
      "url": "https://data.yamaha.com/files/download/other_assets/2/794512/web_VEX7420_R-S202_om_UA_En_A0.pdf"
    },
    {
      "model": "Yamaha RX-485 (US/Canada)",
      "values": {
        "inputZ": 47,
        "outputZ": 0.1
      },
      "ratings": [
        [
          65,
          8,
          "continuous",
          "20 Hz–20 kHz, 0.04% THD"
        ],
        [
          70,
          6,
          "continuous",
          "20 Hz–20 kHz, 0.06% THD"
        ],
        [
          95,
          8,
          "burst",
          "Yamaha dynamic power per channel"
        ],
        [
          115,
          6,
          "burst",
          "Yamaha dynamic power per channel"
        ],
        [
          135,
          4,
          "burst",
          "Yamaha dynamic power per channel"
        ]
      ],
      "note": "North American full-band and IHF dynamic ratings. Output impedance is an upper-bound estimate from the 8 Ω damping factor.",
      "url": "https://www.manualslib.com/manual/3394633/Yamaha-Rx-485.html?page=5"
    },
    {
      "model": "Yamaha RX-V385",
      "values": {},
      "ratings": [
        [
          70,
          6,
          "continuous",
          "20 Hz–20 kHz, 0.09% THD, 2 channels driven"
        ],
        [
          110,
          6,
          "burst",
          "Yamaha dynamic power per channel"
        ],
        [
          130,
          4,
          "burst",
          "Yamaha dynamic power per channel"
        ]
      ],
      "note": "Two-channel and dynamic figures. Check the receiver manual for supported speaker loads.",
      "url": "https://ca.yamaha.com/en/audio/home-audio/products/av-receivers-amps/rx-v385/specs.html"
    }
  ],
  "source": [
    {
      "model": "Creative Sound Blaster X-Fi Titanium HD (RCA)",
      "values": {
        "sourceVoltage": 2,
        "sourceConnection": "RCA",
        "sourceSnr": [
          "122 dB",
          "A-weighted, RCA output"
        ],
        "sourceThdn": [
          "0.001%",
          "RCA output"
        ]
      },
      "note": "2 V RMS full-scale on the front-channel RCA line output. Creative specifies 0.001% THD+N and 122 dB A-weighted SNR. RCA output impedance is unverified.",
      "url": "https://media.dustin.eu/media/d200001003267145/sound-blaster-x-fi-titanium-hd-produktinformation.pdf"
    },
    {
      "model": "FiiO K11 (RCA line out)",
      "values": {
        "sourceVoltage": 1.95,
        "sourceConnection": "RCA",
        "sourceSnr": [
          "≥126 dB",
          "A-weighted, RCA line output"
        ],
        "sourceThdn": [
          "<0.00035%",
          "1 kHz, −0.3 dB, 10 kΩ, RCA line out"
        ]
      },
      "url": "https://www.fiio.com/k11_parameters",
      "note": "Original CS43198-based FiiO K11 (not the K11 R2R). Output is the RCA line-out specification; headphone ports have separate output ratings."
    },
    {
      "model": "iFi ZEN DAC V2 (fixed RCA)",
      "values": {
        "sourceVoltage": 2.1,
        "sourceZ": 100,
        "sourceConnection": "RCA",
        "sourceZLimit": true,
        "sourceSnr": [
          ">116 dB",
          "A-weighted at 0 dBFS"
        ],
        "sourceThdn": [
          "<0.0015%",
          "At 0 dBFS, RCA line output"
        ]
      },
      "note": "Fixed unbalanced RCA output is 2.1 V. The estimate uses iFi’s published 100 Ω upper bound for output impedance.",
      "url": "https://downloads.ifi-audio.com/wp-content/uploads/2021/04/iFi_ZENDAC_V2_Lowdown.pdf"
    },
    {
      "model": "Schiit Modi+ (RCA)",
      "values": {
        "sourceVoltage": 2,
        "sourceZ": 75,
        "sourceConnection": "RCA"
      },
      "note": "2 V RMS and 75 Ω, as documented from the archived Modi+ specifications.",
      "url": "https://audiochainsdb.com/en/gear/schiit-modi-plus",
      "extra": [
        "Schiit Modi+ manual",
        "https://www.schiit.com/public/upload/PDF/modi%20plus%20manual.pdf"
      ]
    },
    {
      "model": "SMSL SU-1 (RCA)",
      "values": {
        "sourceVoltage": 2,
        "sourceConnection": "RCA",
        "sourceSnr": [
          "121 dB",
          "RCA line output"
        ],
        "sourceThdn": [
          "0.00013%",
          "RCA line output"
        ]
      },
      "note": "SMSL lists 2 V RMS line output. The manual does not give RCA output impedance.",
      "url": "https://www.smsl-audio.com/upload/portal/download/SU1Manual.pdf"
    },
    {
      "model": "Topping E30 II (RCA)",
      "values": {
        "sourceVoltage": 2.1,
        "sourceZ": 20,
        "sourceConnection": "RCA",
        "sourceSnr": [
          "123 dB",
          "1 kHz, A-weighted, USB input at 96 kHz"
        ],
        "sourceThdn": [
          "<0.00015%",
          "1 kHz, A-weighted, USB input at 96 kHz"
        ]
      },
      "note": "Topping specifies 2.1 V RMS at 0 dBFS and 20 Ω output impedance for the RCA line output.",
      "url": "https://dl.topping.audio/usermanual/e30ii_e30iil.pdf"
    },
    {
      "model": "WiiM Pro Plus (RCA)",
      "values": {
        "sourceVoltage": 2,
        "sourceConnection": "RCA",
        "sourceSnr": [
          "121 dB",
          "A-weighted, RCA line output"
        ],
        "sourceThdn": [
          "0.00023%",
          "−113 dB, RCA line output"
        ]
      },
      "note": "Uses the default 2 V RMS line-out setting. Update the value if you changed Line Out Level in the WiiM Home app.",
      "url": "https://faq.wiimhome.com/en/support/solutions/articles/72000581028-is-it-possible-to-limit-the-volume-on-a-wiim-device-to-prevent-distortion-",
      "extra": [
        "WiiM Pro Plus owner’s manual",
        "https://www.wiimhome.com/langPdf/en/WiiM%20Pro%20Plus%20UM.pdf"
      ]
    }
  ],
  "headphone": [
    {
      "model": "Audio-Technica ATH-M50x",
      "values": {
        "design": "Closed-back over-ear",
        "sensitivity": 99,
        "basis": "power",
        "load": 38
      },
      "url": "https://www.audio-technica.com.cn/index.php?lang=eng&op=productdetails&pid=927",
      "note": "Wired ATH-M50x, not Bluetooth. Manufacturer specifies 99 dB/mW, 38 Ω and 45 mm drivers."
    },
    {
      "model": "beyerdynamic DT 770 PRO (80 Ω)",
      "values": {
        "design": "Closed-back over-ear",
        "load": 80
      },
      "url": "https://north-america.beyerdynamic.com/p/dt-770-pro-80-ohm",
      "note": "This entry is the 80 Ω version. Manufacturer lists 96 dB nominal SPL but the exact sensitivity reference is not sufficiently established here; enter a verified value for source-drive estimates."
    },
    {
      "model": "Grado SR60x",
      "values": {
        "design": "Open-back on-ear",
        "sensitivity": 99.8,
        "basis": "power",
        "load": 38
      },
      "url": "https://www.gradothailand.com/en/product/sr60x/",
      "note": "Prestige X SR60x, not Classic-series SR60. Manufacturer-regional source lists 38 Ω and 99.8 dB at 1 mW."
    },
    {
      "model": "Grado SR80e",
      "values": {
        "design": "Open-back on-ear",
        "sensitivity": 99.8,
        "basis": "power",
        "load": 32
      },
      "note": "Prestige e-series specification for the SR80e.",
      "url": "https://www.digitec-derouet.com/photos/sr_80_e.pdf"
    },
    {
      "model": "Grado SR80x",
      "values": {
        "design": "Open-back on-ear",
        "sensitivity": 99.8,
        "basis": "power",
        "load": 38
      },
      "note": "Prestige X-series specification for the SR80x.",
      "url": "https://www.gradothailand.com/en/product/sr80x/"
    },
    {
      "model": "Moondrop Chu II",
      "values": {
        "design": "In-ear monitor",
        "sensitivity": 119,
        "basis": "voltage",
        "load": 18,
        "sensitivityConditions": "1 kHz"
      },
      "note": "Analogue Chu II with the 3.5 mm plug. Moondrop specifies 18 Ω ±15% at 1 kHz.",
      "url": "https://moondroplab.com/en-products/chu-ii"
    },
    {
      "model": "Sennheiser HD 560S",
      "values": {
        "design": "Open-back over-ear",
        "sensitivity": 110,
        "basis": "voltage",
        "load": 120,
        "sensitivityConditions": "1 kHz"
      },
      "note": "Sennheiser specifies sensitivity at 1 kHz and 1 V RMS.",
      "url": "https://ca.sennheiser-hearing.com/collections/wired-headphones-1/products/hd-560s"
    },
    {
      "model": "Sennheiser HD 600",
      "values": {
        "design": "Open-back over-ear",
        "sensitivity": 97,
        "basis": "voltage",
        "load": 300
      },
      "note": "Sennheiser’s current HD 600 specification lists 97 dB SPL at 1 V and 300 Ω nominal.",
      "url": "https://support.sennheiser-hearing.com/hc/en-fr/articles/38292415494173-HD-600-Specifications"
    },
    {
      "model": "Shure SE215",
      "values": {
        "design": "In-ear monitor",
        "sensitivity": 107,
        "basis": "power",
        "load": 17,
        "sensitivityConditions": "1 kHz"
      },
      "note": "Shure specifies 17 Ω and 107 dB SPL per milliwatt at 1 kHz.",
      "url": "https://www.shure.com/en-US/docs/guide/SE215"
    },
    {
      "model": "Sony MDR-7506",
      "values": {
        "design": "Closed-back over-ear",
        "sensitivity": 106,
        "basis": "power",
        "load": 63
      },
      "note": "Sony’s manual lists 106 dB per milliwatt and 63 Ω at 1 kHz.",
      "url": "https://pro.sony/support/res/manuals/5024/9f6330320ece5ab8201bda250dd53ce5/50244182M.pdf"
    }
  ]
};
