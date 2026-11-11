'use strict';

const systemCheckGear = {
  "speaker": [
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
      "model": "Axiom Audio Vocal Point VP-100 (original)",
      "values": {
        "load": 8
      },
      "note": "8 Ω. Enter sensitivity from a source specific to the original cabinet. For a centre-channel estimate, choose One speaker under Fine-tune.",
      "url": "https://www.axiomaudio.com/faqs"
    }
  ],
  "amp": [
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
        ],
        [
          180,
          2,
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
