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
                        },
                        fields: ['title', 'caption']
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
                        },
                        fields: ['title', 'caption']
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
                        },
                        fields: ['caption']
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
                        },
                        fields: ['title', 'caption']
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
                        },
                        fields: []
                    },
                    "template_2":{
                        "name": "template_1",
                        "title": "Bumper Template 2",
                        "frames": {
                            "total": 90,
                            "in": 0,
                            "out": 10
                        },
                        fields: []
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
                        },
                        fields: ['image', 'caption', 'credit']
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
                        },
                        fields: ['image', 'caption', 'credit']
                    }
                    // ,
                    // "zoom_in_up": {
                    //   "name": "zoom_in_up",
                    //   "title": "Zoom In/Up",
                    //   "characters": {
                    //     "caption": 95
                    //   },
                    //   "frames": {
                    //     "total": 120,
                    //     "in": 10,
                    //     "out": 10
                    //   },
                    //   fields: ['image', 'caption']
                    // }
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
                        },
                        fields: []
                    }
                }
            },
            "video": {
                "templates": {
                    "template_1": {
                        "name": "template_1",
                        "title": "Video Template 1",
                        "characters": {
                            "caption": 97
                        },
                        "frames": {
                            "total": 120,
                            "in": 10,
                            "out": 10
                        },
                        fields: ['video', 'caption']
                    }
                }
            }
        }
    }
}