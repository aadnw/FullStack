import axios from 'axios'
const baseUrl = 'http://localhost:3001/persons'

const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then(response => {
        return response.data
    })
}

const create = newName => {
    const request = axios.post(baseUrl, newName)
    return request.then(response => {
        return response.data
    })
}

const remove = id => {
    return axios.delete(`${baseUrl}/${id}`).then(response => 
        response.data)
}

const update = (id, updatedNumber) => {
    const request = axios.put(`${baseUrl}/${id}`, updatedNumber)
    return request.then(response => {
        return response.data
    })
}

export default {
    getAll: getAll,
    create: create,
    remove: remove,
    update: update
}