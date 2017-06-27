module.exports = (res, req, next) => {
    return {
        fps: 30,
        themes: {
            'AOL': {
                bumpers: 2
            },
            'AOLComms': {
                bumpers: 2
            },
            'HuffingtonPost': {
                bumpers: 2
            },
            'Moviefone': {
                bumpers: 2
            },
            'Engadget': {
                bumpers: 2
            },
            'Alpha': {
                bumpers: 2
            }
        },
        effects: {
            0: 'No Effect',
            1: 'Pan/Zoom Out',
            2: 'Pan/Zoom In'
        },
        transitions: {
            0: 'No Transition',
            1: 'Slide In',
            2: 'Slide Out',
            3: 'Slide In/Out'
        },
        textAlignments: {
            0: "Top Left",
            1: "Top Center",
            2: "Top Right",
            3: "Middle Left",
            4: "Middle Center",
            5: "Middle Right",
            6: "Bottom Left",
            7: "Bottom Center",
            8: "Bottom Right"
        },
        audioTracks: [
            'Frosted_Glass.mp3',
            'Gentle_Marimbas.mp3',
            'Orange_Juicier.mp3',
            'Solar_Dance.mp3',
            'Together_Soon.mp3',
            'Under_The_Lights.mp3',
            'Were_The_Ones.mp3',
            'Nerves.mp3',
            'Evenplus.mp3'
        ],
        slideTypes: {
            quotation: {
                fields: ['title', 'caption'],
                frames: 90
            },
            title: {
                fields: ['image', 'credit', 'caption'],
                frames: 90
            },
            date: {
                fields: ['title', 'caption'],
                frames: 90
            },
            bumper: {
                fields: ['bumper'],
                frames: 90
            },
            image: {
                fields: ['image', 'caption', 'credit'],
                frames: 120
            },
            share: {
                fields: [],
                frames: 90
            },
            video: {
                fields: ['video', 'caption', 'credit'],
                frames: 120
            }
        }
    }
}