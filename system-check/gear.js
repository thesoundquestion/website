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
        "sourceVoltage": 2
      },
      "note": "2 V RMS full-scale on the front-channel RCA line output. Creative specifies 0.001% THD+N and 122 dB A-weighted SNR. RCA output impedance is unverified.",
      "url": "https://media.dustin.eu/media/d200001003267145/sound-blaster-x-fi-titanium-hd-produktinformation.pdf"
    },
    {
      "model": "iFi ZEN DAC V2 (fixed RCA)",
      "values": {
        "sourceVoltage": 2.1,
        "sourceZ": 100
      },
      "note": "Fixed unbalanced RCA output is 2.1 V. The estimate uses iFi’s published 100 Ω upper bound for output impedance.",
      "url": "https://downloads.ifi-audio.com/wp-content/uploads/2021/04/iFi_ZENDAC_V2_Lowdown.pdf"
    },
    {
      "model": "Schiit Modi+ (RCA)",
      "values": {
        "sourceVoltage": 2,
        "sourceZ": 75
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
        "sourceVoltage": 2
      },
      "note": "SMSL lists 2 V RMS line output. The manual does not give RCA output impedance.",
      "url": "https://www.smsl-audio.com/upload/portal/download/SU1Manual.pdf"
    },
    {
      "model": "Topping E30 II (RCA)",
      "values": {
        "sourceVoltage": 2.1,
        "sourceZ": 20
      },
      "note": "Topping specifies 2.1 V RMS at 0 dBFS and 20 Ω output impedance for the RCA line output.",
      "url": "https://dl.topping.audio/usermanual/e30ii.pdf"
    },
    {
      "model": "WiiM Pro Plus (RCA)",
      "values": {
        "sourceVoltage": 2
      },
      "note": "Uses the default 2 V RMS line-out setting. Update the value if you changed Line Out Level in the WiiM Home app.",
      "url": "https://faq.wiimhome.com/en/support/solutions/articles/72000581028-is-it-possible-to-limit-the-volume-on-a-wiim-device-to-prevent-distortion-"
    }
  ],
  "headphone": [
    {
      "model": "Grado SR80x",
      "note": "38 Ω nominal, 99.8 dB SPL at 1 mW. Headphone reference only. The speaker-at-a-seat estimate does not use these values.",
      "url": "https://www.gradothailand.com/en/product/sr80x/"
    }
  ]
};
