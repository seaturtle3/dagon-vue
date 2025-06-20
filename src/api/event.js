import axios from 'axios'

export const createEvent = async (eventData, token) => {
    const res = await axios.post('/api/admin/event', eventData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    return res.data
}

export const updateEvent = async (id, eventData, token) => {
    const res = await axios.post(`/api/admin/event/${id}`, eventData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    return res.data
}

export const fetchEventById = async (id) => {
    const res = await axios.get(`/api/event/${id}`)
    return res.data
}

export const deleteEvent = async (id, token) => {
    await axios.delete(`/api/admin/event/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}