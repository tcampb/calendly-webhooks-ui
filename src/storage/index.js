export const loadAuthContext = () => {
    const context = localStorage.getItem('authContext')

    if (context) {
        return JSON.parse(context)
    }
}

export const saveAuthContext = (context) => {
    localStorage.setItem('authContext', JSON.stringify(context))
}

export const deleteAuthContext = () => {
    localStorage.removeItem('authContext')
}