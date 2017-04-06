module.exports = (res, req, next) => {
  return {
    "fps": 30,
    "slideTypes": {
      "quotation": {
        "templates": {
          "template_1": {
            "name": "template_1",
            "title": "Quotation Template 1",
            "characters": {
              "title": 48,
              "caption": 118
            },
            "frames": {
              "total": 90,
              "in": 0,
              "out": 10
            }
          }
        }
      },
      "joke": {
        "templates": {
          "template_1": {
            "name": "template_1",
            "title": "Joke Template 1",
            "characters": {
              "title": 99,
              "caption": 113
            },
            "frames": {
              "total": 90,
              "in": 0,
              "out": 0
            }
          }
        }
      },
      "title": {
        "templates": {
          "template_1": {
            "name": "template_1",
            "title": "Title Template 1",
            "characters": {
              "caption": 42
            },
            "frames": {
              "total": 90,
              "in": 10,
              "out": 10
            }
          }
        }
      },
      "date": {
        "templates": {
          "template_1": {
            "name": "template_1",
            "title": "Date Template 1",
            "characters": {
              "title": 100,
              "caption": 100
            },
            "frames": {
              "total": 90,
              "in": 0,
              "out": 10
            }
          }
        }
      },
      "bumper": {
        "templates": {
          "template_1": {
            "name": "template_1",
            "title": "Bumper Template 1",
            "frames": {
              "total": 90,
              "in": 10,
              "out": 10
            }
          },
          "template_2":{
            "name": "template_1",
            "title": "Bumper Template 2",
            "frames": {
              "total": 90,
              "in": 0,
              "out": 10
            }
          }
        }
      },
      "image": {
        "templates": {
          "slide_in_out": {
            "name": "slide_in_out",
            "title": "Slide In/Out",
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
            "name": "slide_in_out_split",
            "title": "Slide In/Out Splitscreen",
            "characters": {
              "caption": 85
            },
            "frames": {
              "total": 120,
              "in": 10,
              "out": 10
            }
          },
          "zoom_in_up": {
            "name": "zoom_in_up",
            "title": "Zoom In/Up",
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
      },
      "share": {
        "templates": {
          "template_1": {
            "name": "template_1",
            "title": "Share Template 1",
            "frames": {
              "total": 90,
              "in": 0,
              "out": 0
            }
          }
        }
      }
      // ,
      // "video": {
      //   "templates": {

      //   }
      // }
    }
  }
}