module.exports = (res, req, next) => {
  return {
    "fps": 30,
    "templates": {
      "bumper": {
        "title": "Story Bumper",
        "visible": false,
        "frames": {
          "total": 90,
          "in": 10,
          "out": 10
        }
      },
      "bumper_joke":{
        "title": "Joke Bumper",
        "visible": false,
        "frames": {
          "total": 90,
          "in": 0,
          "out": 10
        }
      },
      "date": {
        "title": "Today's Date",
        "visible": false,
        "characters": {
          "title": 100,
          "caption": 100
        },
        "frames": {
          "total": 90,
          "in": 0,
          "out": 10
        }
      },
      "joke": {
        "title": "Joke",
        "visible": true,
        "characters": {
          "title": 99,
          "caption": 113
        },
        "frames": {
          "total": 90,
          "in": 0,
          "out": 0
        }
      },
      "quote": {
        "title": "Quotation",
        "visible": true,
        "characters": {
          "title": 48,
          "caption": 118
        },
        "frames": {
          "total": 90,
          "in": 0,
          "out": 10
        }
      },
      "share": {
        "title": "Share",
        "visible": false,
        "frames": {
          "total": 90,
          "in": 0,
          "out": 0
        }
      },
      "slide_in_out": {
        "title": "Slide In/Out",
        "visible": true,
        "characters": {
          "caption": 97
        },
        "frames": {
          "total": 120,
          "in": 10,
          "out": 10
        }
      },
      "slide_in_out_split": {
        "title": "Slide In/Out Splitscreen",
        "visible": true,
        "characters": {
          "caption": 85
        },
        "frames": {
          "total": 120,
          "in": 10,
          "out": 10
        }
      },
      "title_1": {
        "title": "Story Title",
        "visible": true,
        "characters": {
          "caption": 42
        },
        "frames": {
          "total": 90,
          "in": 10,
          "out": 10
        }
      },
      "zoom_in_up": {
        "title": "Zoom In/Up",
        "visible": true,
        "characters": {
          "caption": 95
        },
        "frames": {
          "total": 120,
          "in": 10,
          "out": 10
        }
      }
    }
  }
}