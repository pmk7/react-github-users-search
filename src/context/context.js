import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext = React.createContext()

const GithubProvider = ({children}) => {
    const [githubUser, setGithubUser] = useState(mockUser)
    const [repos, setRepos] = useState(mockRepos)
    const [followers, setFollowers] = useState(mockFollowers)
    // request loading
    const [requests,setRequests] = useState(0)
    const [isLoading,setIsLoading] = useState(false)
    // error
    const [error, setError] = useState({show:false,msg:''})

    const searchGithubUser = async (user) => {
        toggleError()
        setIsLoading(true)
        const response = await axios(`${rootUrl}/users/${user}`).catch(err=> console.log(err))
        if(response) {
            setGithubUser(response.data)
            const {login,followers_url} = response.data
            // repos
            axios(`${rootUrl}/users/${login}/repos?per_page=100`).then(response => setRepos(response.data))
            // followers
            axios(`${followers_url}?per_page=100`).then(response => setFollowers(response.data))
            // https://api.github.com/users/john-smilga/repos?per_page=100
            // followers
            // https://api.github.com/users/john-smilga/followers
        }
        else {
            toggleError(true,'no user matches your search')
        }
        checkRequests()
        setIsLoading(false)

    } 
   
   
    // check rate
 const checkRequests = () => {
axios(`${rootUrl}/rate_limit`).then(({data})=> {
console.log(data)

let {rate:{remaining:reqsRemaining}} = data

console.log(reqsRemaining);
setRequests(reqsRemaining)
// FIX LATER!

if(reqsRemaining === 0) {
    toggleError(true,"sorry, you've exceeded your hourly limit")
}
}).catch((err)=> console.log(err))
}



function toggleError(show = false, msg = '') {
     setError({show,msg})
 }  
    // errors


useEffect(checkRequests,[])


    return <GithubContext.Provider value={{githubUser,repos,followers,requests,error,searchGithubUser,isLoading}}>
        {children}
    </GithubContext.Provider>
}

export {GithubProvider,GithubContext}