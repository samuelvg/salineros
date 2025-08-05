const acordesDefinidos ={
    "C": {
      "name": "C",
      "chord": [[1, 0], [2, 1], [3, 0], [4, 2], [5, 3], [6, 0]],
      "position": 0,
      "bars": []
    },
    "Cm": {
      "name": "Cm",
      "chord": [[1, 3],[2, 4], [3, 5], [4, 5], [5, 3], [6, "x"]],
      "position": 3,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 3 }]
    },
    "C7": {
      "name": "C7",
      "chord": [[1, 3], [2, 5],[3, 3], [4, 5], [5, 3], [6, "x"]],
      "position": 3,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 3 }]
    },
    "Cm7": {
      "name": "Cm7",
      "chord": [[1,3], [2, 4], [3, 3], [4, 5], [5, 3], [6, "x"]],
      "position": 3,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 3 }]
    },
    "Cmaj7": {
      "name": "Cmaj7",
      "chord": [[1, 0], [2, 0], [3, 0], [4, 2], [5, 3], [6, "x"]],
      "position": 0,
      "bars": []
    },
    "Cdim": {
      "name": "Cdim",
      "chord": [[1, 2], [2, 1], [3, 2], [4, 1], [5, "x"], [6, "x"]],
      "position": 0,
      "bars": []
    },
    "Caug": {
      "name": "Caug",
      "chord": [[1, 0], [2, 1], [3, 1], [4, 2], [5, "x"], [6, "x"]],
      "position": 0,
      "bars": []
    },
    "C#": {
      "name": "C#",
      "chord": [[1, 4], [2, 6], [3, 6], [4, 6], [5, 4], [6, "x"]],
      "position": 4,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 4 }]
    },
    "C#m": {
      "name": "C#m",
      "chord": [[1, 4], [2, 5], [3, 6], [4, 6], [5, 4], [6, "x"]],
      "position": 4,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 4 }]
    },
    "C#7": {
      "name": "C#7",
      "chord": [[1, 4], [2, 6], [3, 4], [4, 6], [5, 4], [6, "x"]],
      "position": 4,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 4 }]
    },
    "C#m7": {
      "name": "C#m7",
      "chord": [[1, 4], [2, 5], [3, 4], [4, 6], [5, 4], [6, "x"]],
      "position": 4,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 4 }]
    },
    "C#maj7": {
      "name": "C#maj7",
      "chord": [[3, 1], [4, 2], [5, 4]],
      "position": 4,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 4 }]
    },
    "C#dim": {
      "name": "C#dim",
      "chord": [[2, 1], [4, 2]],
      "position": 4,
      "bars": [{ "from_string": 4, "to_string": 1, "fret": 4 }]
    },
    "C#aug": {
      "name": "C#aug",
      "chord": [[3, 1], [4, 2], [5, 4]],
      "position": 4,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 4 }]
    },
    "Db": {
      "name": "Db",
      "chord": [[1, 4], [2, 6], [3, 6], [4, 6], [5, 4], [6, "x"]],
      "position": 4,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 4 }]
    },
    "Dbm": {
      "name": "Dbm",
      "chord": [[1, 4], [2, 5], [3, 6], [4, 6], [5, 4], [6, "x"]],
      "position": 4,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 4 }]
    },
    "Db7": {
      "name": "Db7",
      "chord": [[1, 4], [2, 6], [3, 4], [4, 6], [5, 4], [6, "x"]],
      "position": 4,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 4 }]
    },
    "Dbm7": {
      "name": "Dbm7",
      "chord": [[1, 4], [2, 5], [3, 4], [4, 6], [5, 4], [6, "x"]],
      "position": 4,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 4 }]
    },
    "Dbmaj7": {
      "name": "Dbmaj7",
      "chord": [[3, 1], [4, 2], [5, 4]],
      "position": 4,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 4 }]
    },
    "Dbdim": {
      "name": "Dbdim",
      "chord": [[2, 1], [4, 2]],
      "position": 4,
      "bars": [{ "from_string": 4, "to_string": 1, "fret": 4 }]
    },
    "Dbaug": {
      "name": "Dbaug",
      "chord": [[3, 1], [4, 2], [5, 4]],
      "position": 4,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 4 }]
    },
    "D": {
      "name": "D",
      "chord": [[1, 2], [2, 3], [3, 2], [4, 0], [5, "x"], [6, "x"]],
      "position": 0,
      "bars": []
    },
    "Dm": {
      "name": "Dm",
      "chord": [[1, 1], [2, 3], [3, 2], [4, 0], [5, "x"], [6, "x"]],
      "position": 0,
      "bars": []
    },
    "D7": {
      "name": "D7",
      "chord": [[1, 2], [2, 1], [3, 2], [4, 0], [5, "x"], [6, "x"]],
      "position": 0,
      "bars": []
    },
    "Dm7": {
      "name": "Dm7",
      "chord": [[1, 1], [2, 1], [3, 2], [4, 0], [5, "x"], [6, "x"]],
      "position": 0,
      "bars": []
    },
    "Dmaj7": {
      "name": "Dmaj7",
      "chord": [[1, 2], [2, 2], [3, 2], [4, 0], [5, "x"], [6, "x"]],
      "position": 0,
      "bars": []
    },
    "Ddim": {
      "name": "Ddim",
      "chord": [[1, 1], [2, 0], [3, 1], [4, 0], [5, "x"], [6, "x"]],
      "position": 0,
      "bars": []
    },
    "Daug": {
      "name": "Daug",
      "chord": [[1, 2], [2, 3], [3, 3], [4, 0], [5, "x"], [6, "x"]],
      "position": 0,
      "bars": []
    },
    "D#": {
      "name": "D#",
      "chord": [[1, 3], [2, 4], [3, 3], [4, 1], [5, "x"], [6, "x"]],
      "position": 1,
      "bars": [{ "from_string": 4, "to_string": 1, "fret": 1 }]
    },
    "D#m": {
      "name": "D#m",
      "chord": [[1, 2], [2, 4], [3, 3], [4, 1], [5, "x"], [6, "x"]],
      "position": 1,
      "bars": [{ "from_string": 4, "to_string": 1, "fret": 1 }]
    },
    "D#7": {
      "name": "D#7",
      "chord": [[1, 3], [2, 2], [3, 3], [4, 1], [5, "x"], [6, "x"]],
      "position": 1,
      "bars": [{ "from_string": 4, "to_string": 1, "fret": 1 }]
    },
    "D#m7": {
      "name": "D#m7",
      "chord": [[1, 1], [2, 2], [3, 3]],
      "position": 1,
      "bars": [{ "from_string": 4, "to_string": 1, "fret": 1 }]
    },
    "D#maj7": {
      "name": "D#maj7",
      "chord": [[1, 1], [2, 2], [3, 3]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "D#dim": {
      "name": "D#dim",
      "chord": [[1, 1], [2, 2], [3, 3]],
      "position": 1,
      "bars": [{ "from_string": 4, "to_string": 1, "fret": 1 }]
    },
    "D#aug": {
      "name": "D#aug",
      "chord": [[1, 1], [2, 2], [3, 3]],
      "position": 1,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 1 }]
    },
    "Eb": {
      "name": "Eb",
      "chord": [[1, 3], [2, 4], [3, 3], [4, 1], [5, "x"], [6, "x"]],
      "position": 1,
      "bars": [{ "from_string": 4, "to_string": 1, "fret": 1 }]
    },
    "Ebm": {
      "name": "Ebm",
      "chord": [[1, 2], [2, 4], [3, 3], [4, 1], [5, "x"], [6, "x"]],
      "position": 1,
      "bars": [{ "from_string": 4, "to_string": 1, "fret": 1 }]
    },
    "Eb7": {
      "name": "Eb7",
      "chord": [[1, 3], [2, 2], [3, 3]],
      "position": 1,
      "bars": [{ "from_string": 4, "to_string": 1, "fret": 1 }]
    },
    "Ebm7": {
      "name": "Ebm7",
      "chord": [[1, 1], [2, 2], [3, 3]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "Ebmaj7": {
      "name": "Ebmaj7",
      "chord": [[1, 1], [2, 2], [3, 3]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "Ebdim": {
      "name": "Ebdim",
      "chord": [[1, 1], [2, 2], [3, 3]],
      "position": 1,
      "bars": [{ "from_string": 4, "to_string": 1, "fret": 1 }]
    },
    "Ebaug": {
      "name": "Ebaug",
      "chord": [[1, 1], [2, 2], [3, 3]],
      "position": 1,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 1 }]
    },
    "E": {
      "name": "E",
      "chord": [[1, 0], [2, 0], [3, 1], [4, 2], [5, 2], [6, 0]],
      "position": 0,
      "bars": []
    },
    "Em": {
      "name": "Em",
      "chord": [[1, 0], [2, 0], [3, 0], [4, 2], [5, 2], [6, 0]],
      "position": 0,
      "bars": []
    },
    "E7": {
      "name": "E7",
      "chord": [[1, 0], [2, 0], [3, 1], [4, 0], [5, 2], [6, 0]],
      "position": 0,
      "bars": []
    },
    "Em7": {
      "name": "Em7",
      "chord": [[1, 0], [2, 3], [3, 0], [4, 0], [5, 2], [6, 0]],
      "position": 0,
      "bars": []
    },
    "Emaj7": {
      "name": "Emaj7",
      "chord": [[3, 1], [4, 1], [5, 2]],
      "position": 0,
      "bars": []
    },
    "Edim": {
      "name": "Edim",
      "chord": [[3, 1], [4, 2], [5, 2]],
      "position": 0,
      "bars": []
    },
    "Eaug": {
      "name": "Eaug",
      "chord": [[3, 1], [4, 2], [5, 2]],
      "position": 0,
      "bars": []
    },
    "F": {
      "name": "F",
      "chord": [[3, 2], [4, 3], [5, 3]],
      "position": 1,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 1 }]
    },
    "Fm": {
      "name": "Fm",
      "chord": [[4, 3], [5, 3]],
      "position": 1,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 1 }]
    },
    "F7": {
      "name": "F7",
      "chord": [[3, 2], [5, 3]],
      "position": 1,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 1 }]
    },
    "Fm7": {
      "name": "Fm7",
      "chord": [[2, 4], [5, 3]],
      "position": 1,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 1 }]
    },
    "Fmaj7": {
      "name": "Fmaj7",
      "chord": [[2, 1], [3, 2], [4, 3], [5, 4]],
      "position": 1,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 1 }]
    },
    "Fdim": {
      "name": "Fdim",
      "chord": [[2, 1], [3, 2], [4, 3], [5, 4]],
      "position": 1,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 1 }]
    },
    "Faug": {
      "name": "Faug",
      "chord": [[2, 1], [3, 2], [4, 3], [5, 4]],
      "position": 1,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 1 }]
    },
    "F#": {
      "name": "F#",
      "chord": [[3, 3], [4, 4], [5, 4]],
      "position": 2,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 2 }]
    },
    "F#m": {
      "name": "F#m",
      "chord": [[4, 4], [5, 4]],
      "position": 0,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 2 }]
    },
    "F#7": {
      "name": "F#7",
      "chord": [[3, 3], [5, 4]],
      "position": 0,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 2 }]
    },
    "F#m7": {
      "name": "F#m7",
      "chord": [[2, 5], [5, 4]],
      "position": 0,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 2 }]
    },
    "F#maj7": {
      "name": "F#maj7",
      "chord": [[2, 1], [3, 2], [4, 3], [5, 4]],
      "position": 2,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 2 }]
    },
    "F#dim": {
      "name": "F#dim",
      "chord": [[2, 1], [3, 2], [4, 3], [5, 4]],
      "position": 2,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 2 }]
    },
    "F#aug": {
      "name": "F#aug",
      "chord": [[2, 1], [3, 2], [4, 3], [5, 4]],
      "position": 2,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 2 }]
    },
    "Gb": {
      "name": "Gb",
      "chord": [[3, 3], [4, 4], [5, 4]],
      "position": 2,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 2 }]
    },
    "Gbm": {
      "name": "Gbm",
      "chord": [[4, 4], [5, 4]],
      "position": 2,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 2 }]
    },
    "Gb7": {
      "name": "Gb7",
     "chord": [[3, 3], [5, 4]],
      "position": 2,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 2 }]
    },
    "Gbm7": {
      "name": "Gbm7",
      "chord": [[2, 5], [5, 4]],
      "position": 2,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 2 }]
    },
    "Gbmaj7": {
      "name": "Gbmaj7",
      "chord": [[2, 1], [3, 2], [4, 3], [5, 4]],
      "position": 2,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 2 }]
    },
    "Gbdim": {
      "name": "Gbdim",
      "chord": [[2, 1], [3, 2], [4, 3], [5, 4]],
      "position": 2,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 2 }]
    },
    "Gbaug": {
      "name": "Gbaug",
      "chord": [[2, 1], [3, 2], [4, 3], [5, 4]],
      "position": 2,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 2 }]
    },
    "G": {
      "name": "G",
      "chord": [[1, 3], [2, 0], [3, 0], [4, 0], [5, 2], [6, 3]],
      "position": 0,
      "bars": []
    },
    "Gm": {
      "name": "Gm",
      "chord": [[3, 3], [4, 5], [5, 5]],
      "position": 3,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 3 }]
    },
    "G7": {
      "name": "G7",
      "chord": [[1, 1], [2, 0], [3, 0], [4, 0], [5, 2], [6, 3]],
      "position": 0,
      "bars": []
    },
    "Gm7": {
      "name": "Gm7",
      "chord": [[5, 5]],
      "position": 3,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 3 }]
    },
    "Gmaj7": {
      "name": "Gmaj7",
      "chord": [[2, 2], [3, 4], [5, 4]],
      "position": 3,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 3 }]
    },
    "Gdim": {
      "name": "Gdim",
      "chord": [[1, 1], [3, 3], [5, 5]],
      "position": 3,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 3 }]
    },
    "Gaug": {
      "name": "Gaug",
      "chord": [[1, 1], [3, 3], [5, 5]],
      "position": 3,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 3 }]
    },
    "G#": {
      "name": "G#",
      "chord": [[3, 5], [4, 6], [5, 6]],
      "position": 0,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 4 }]
    },
    "G#m": {
      "name": "G#m",
      "chord": [[4, 6], [5, 6]],
      "position": 4,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 4 }]
    },
    "G#7": {
      "name": "G#7",
      "chord": [[3, 5], [5, 6]],
      "position": 4,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 4 }]
    },
    "G#m7": {
      "name": "G#m7",
      "chord": [[3, 7], [5, 6]],
      "position": 4,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 4 }]
    },
    "G#maj7": {
      "name": "G#maj7",
      "chord": [[2, 1], [3, 1], [4, 1], [5, 3]],
      "position": 4,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 4 }]
    },
    "G#dim": {
      "name": "G#dim",
      "chord": [[2, 1], [4, 4], [5, 4]],
      "position": 4,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 4 }]
    },
    "G#aug": {
      "name": "G#aug",
      "chord": [[2, 1], [3, 1], [4, 1], [5, 3]],
      "position": 4,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 4 }]
    },
    "Ab": {
      "name": "Ab",
       "chord": [[3, 5], [4, 6], [5, 6]],
      "position": 4,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 4 }]
    },
    "Abm": {
      "name": "Abm",
      "chord": [[4, 6], [5, 6]],
      "position": 4,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 4 }]
    },
    "Ab7": {
      "name": "Ab7",
       "chord": [[3, 5], [5, 6]],
      "position": 4,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 4 }]
    },
    "Abm7": {
      "name": "Abm7",
      "chord": [[3, 7], [5, 6]],
      "position": 4,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 4 }]
    },
    "Abmaj7": {
      "name": "Abmaj7",
      "chord": [[2, 1], [3, 1], [4, 1], [5, 3]],
      "position": 4,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 4 }]
    },
    "Abdim": {
      "name": "Abdim",
      "chord": [[2, 1], [4, 4], [5, 4]],
      "position": 4,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 4 }]
    },
    "Abaug": {
      "name": "Abaug",
      "chord": [[2, 1], [3, 1], [4, 1], [5, 3]],
      "position": 4,
      "bars": [{ "from_string": 6, "to_string": 1, "fret": 4 }]
    },
    "A": {
      "name": "A",
      "chord": [[2, 2], [3, 2], [4, 2], [6, "x"]],
      "position": 0,
      "bars": []
    },
    "Am": {
      "name": "Am",
      "chord": [[2, 1], [3, 2], [4, 2], [6, "x"]],
      "position": 0,
      "bars": []
    },
    "A7": {
      "name": "A7",
      "chord": [[2, 2], [4, 2], [6, "x"]],
      "position": 0,
      "bars": []
    },
    "Am7": {
      "name": "Am7",
      "chord": [[2, 1], [4, 2], [6, "x"]],
      "position": 0,
      "bars": []
    },
    "Amaj7": {
      "name": "Amaj7",
      "chord": [[2, 2], [3, 1], [4, 2]],
      "position": 0,
      "bars": []
    },
    "Adim": {
      "name": "Adim",
      "chord": [[2, 2], [3, 1], [4, 2]],
      "position": 0,
      "bars": []
    },
    "Aaug": {
      "name": "Aaug",
      "chord": [[2, 2], [3, 1], [4, 2]],
      "position": 0,
      "bars": []
    },
    "A#": {
      "name": "A#",
      "chord": [[2, 3], [3, 3], [4, 3], [6, "x"]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "A#m": {
      "name": "A#m",
      "chord": [[2, 2], [3, 3], [4, 3], [6, "x"]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "A#7": {
      "name": "A#7",
      "chord": [[2, 3], [4, 3], [6, "x"]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "A#m7": {
      "name": "A#m7",
      "chord": [[2, 2], [4, 3], [6, "x"]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "A#maj7": {
      "name": "A#maj7",
      "chord": [[2, 1], [3, 3], [4, 3]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "A#dim": {
      "name": "A#dim",
      "chord": [[2, 1], [3, 3], [4, 3]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "A#aug": {
      "name": "A#aug",
      "chord": [[2, 1], [3, 3], [4, 3]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "Bb": {
      "name": "Bb",
      "chord": [[2, 3], [3, 3], [4, 3], [6, "x"]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "Bbm": {
      "name": "Bbm",
      "chord": [[2, 2], [3, 3], [4, 3], [6, "x"]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "Bb7": {
      "name": "Bb7",
      "chord": [[2, 3], [4, 3], [6, "x"]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "Bbm7": {
      "name": "Bbm7",
     "chord": [[2, 2], [4, 3], [6, "x"]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "Bbmaj7": {
      "name": "Bbmaj7",
      "chord": [[2, 1], [3, 3], [4, 3]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "Bbdim": {
      "name": "Bbdim",
      "chord": [[2, 1], [3, 3], [4, 3]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "Bbaug": {
      "name": "Bbaug",
      "chord": [[2, 1], [3, 3], [4, 3]],
      "position": 1,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 1 }]
    },
    "B": {
      "name": "B",
      "chord": [[2, 4], [3, 4], [4, 4], [6, "x"]],
      "position": 0,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 2 }]
    },
    "Bm": {
      "name": "Bm",
      "chord": [[2, 3], [3, 4], [4, 4], [6, "x"]],
      "position": 0,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 2 }]
    },
    "B7": {
      "name": "B7",
      "chord": [[1, 2], [2, 0], [3, 2], [4, 1], [5, 2], [6, "x"]],
      "position": 0,
      "bars": []
    },
    "Bm7": {
      "name": "Bm7",
      "chord": [[2, 3], [4, 4], [6, "x"]],
      "position": 0,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 2 }]
    },
    "Bmaj7": {
      "name": "Bmaj7",
      "chord": [[2, 2], [3, 4], [4, 4]],
      "position": 2,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 2 }]
    },
    "Bdim": {
      "name": "Bdim",
      "chord": [[2, 2], [3, 4], [4, 4]],
      "position": 2,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 2 }]
    },
    "Baug": {
      "name": "Baug",
      "chord": [[2, 2], [3, 4], [4, 4]],
      "position": 2,
      "bars": [{ "from_string": 5, "to_string": 1, "fret": 2 }]
    }
  };  