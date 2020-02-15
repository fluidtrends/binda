const ejs = require('ejs')
const fs = require('fs-extra')
const path = require('path')

class _ {
    constructor(props) {
        this._props = Object.assign({}, props)
    }

    get props() {
        return this._props
    }

    get filepath() {
        return this.props.filepath
    }

    get dir () {
        return this.props.dir
    }

    get path() {
        return (!this.dir || !this.filepath) ? null : path.resolve(this.dir, this.filepath)
    }

    get exists() {
        return this.path && fs.existsSync(path.resolve(this.path))
    }

    get type () {
        return this._type || _.TYPES.ASSET
    }

    detectType () {
        if (this._type) {
            // Not necessary
            return 
        }

        // Figure out the file's extension
        const ext = path.extname(this.path).toUpperCase().substring(1)

        for (let [type, values] of Object.entries(_.TYPES)) {
            if (values.includes(ext)) {
                // Looks like we recognize this type
                this._type = values
                return 
            }
        }
    }

    get isCompilable() {
        return !_.NONCOMPILABLE_TYPES.includes(this.type)
    }

    compile(args, options = {}) {
        if (!this.isCompilable) {
            // No need to compile
            return Promise.resolve()
        }

        return new Promise((resolve, reject) => {
            try {
                // Attempt to load the file 
                const content = fs.readFileSync(this.path, 'utf8')

                if (!content) {
                    // Next let's make sure we stop right here for empty files
                    resolve("")
                    return
                }

                // Try to parse the file and catch syntax errors
                const template = ejs.compile(content, {})

                // Finally, let's see if we can validate it
                const output = template(args)

                // We're good
                resolve(options.json ? JSON.parse(output, null, 2) : output)
            } catch (error) {
                reject(new Error(_.ERRORS.CANNOT_LOAD(error.message)))
            }
        })
    }

    load(args, options = {}) {
        if (!this.exists) {
            // First make sure the file exists
            return Promise.reject(new Error(_.ERRORS.CANNOT_LOAD('it does not exist')))
        }

        // Let's see if this is a recognized file y]type 
        this.detectType()

        // Compile the file if necessary
        return this.compile(args, options)
    }

    copy(dest) {
        return new Promise((resolve, reject) => {
            // Let's move the file over
            fs.copySync(this.path, path.resolve(dest, this.filepath))
            
            resolve()
        })    
    }

    save(dest, args = {}) {
        if (!this.exists) {
            // First make sure the file exists
            return Promise.reject(new Error(_.ERRORS.CANNOT_SAVE('it does not exist')))
        }

        if (!fs.existsSync(dest)) {
            // First make sure the destination location
            return Promise.reject(new Error(_.ERRORS.CANNOT_SAVE('the destination does not exist')))
        }

        // Let's see if this is a recognized file type 
        this.detectType()

        // Create sub directories if necessary
        const dir = path.resolve(this.dir, path.dirname(this.filepath))
        fs.exists(dir) || fs.mkdirs(dir)

        if (!this.isCompilable) {
            // Let's move the file over
            return this.copy(dest)
        }

        // Load and then save it
        return this.load(args).then((output) => {
            fs.writeFileSync(path.resolve(dest, this.filepath), output, 'utf8')
        })

    }
}

_.ERRORS = {
    CANNOT_LOAD: (reason) => reason ? `Cannot load file because ${reason}` : `Cannot load file`,
    CANNOT_SAVE: (reason) => reason ? `Cannot save file because ${reason}` : `Cannot save file`
}

_.TYPES = {
    ASSET: "ASSET_TYPE",
    IMAGE: ["PNG", "JPG", "JPEG", "GIF", "SVG"],
    JSON: ["JSON"],
    JAVASCRIPT: ["JS"],
    CSS: ["CSS"],
    MARKDOWN: ["MD"]
}

_.NONCOMPILABLE_TYPES = [ _.TYPES.ASSET, _.TYPES.IMAGE ]

module.exports = _