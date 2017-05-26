module.exports = (res, req, next) => {
    return {
        fps: 30,
        themes: {
            'Alpha': {
                bumpers: 2
            },
            'AOL': {
                bumpers: 0
            },
            'AOLComms': {
                bumpers: 0
            },
            'HuffingtonPost': {
                bumpers: 0
            },
            'Moviefone': {
                bumpers: 0
            },
            'Engadget': {
                bumpers: 0
            }
        },
        effects: {
            0: 'No Effect',
            1: 'Pan/Zoom In',
            2: 'Pan/Zoom Out'
        },
        transitions: {
            0: 'No Transition',
            1: 'Slide In',
            2: 'Slide Out',
            3: 'Slide In/Out'
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
                fields: ['caption'],
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
                fields: ['video', 'caption'],
                frames: 120
            }
        }
    }
}