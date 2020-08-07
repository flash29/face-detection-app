import React,{Component} from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import './App.css';
import 'tachyons';
import Particles from 'react-particles-js';
//import Clarifai from 'clarifai';
//"start": "react-scripts start", removed from package


const particlesOptions={
            		particles: {
            			number:{
                    value:30,
                    density:{
                      enable:true,
                      value_area:200
                    }
                  }
            		}
            	}
const initialState={
    input:'',
    imageUrl:'',
    box:{},
    route:'signin',
    isSignedIn:false,
    user:{
        id:'',
        name:'',
        email:'',
        entries:0,
        joined :'',
    }
}
class App extends Component {
  constructor(){
    super();
    this.state=initialState;
  }

  loadUser =(data)=> {
      this.setState({user: {
          name:data.name,
          id:data.id,
          email:data.email,
          entries:data.entires,
          joined :data.joined,

      }})
  }

  calculateFaceLocation =(data)=>{
      const clarifaiFace =data.outputs[0].data.regions[0].region_info.bounding_box;
      const image=document.getElementById('inputimage');
      const width= Number(image.width);
      const height= Number(image.height);
      return{
          leftCol:clarifaiFace.left_col * width,
          topRow: clarifaiFace.top_row*height,
          rightCol: width -(clarifaiFace.right_col*width),
          bottomRow: height -(clarifaiFace.bottom_row * height),
      }
  }

  displayFaceBox=(box)=>{
      this.setState({box:box});

  }

  onInputChange=(event)=>{
    this.setState({input :event.target.value});
  }
  onButtonSubmit=()=>{
      this.setState({imageUrl:this.state.input});
      fetch('https://nameless-taiga-08314.herokuapp.com/imageurl',{
          method:'post',
          headers:{'Content-type':'application/json'},
          body:JSON.stringify({
              input: this.state.input
          })
      })
      .then(response=>response.json())
      .then(response => {
          if(response){
              fetch('https://nameless-taiga-08314.herokuapp.com/image',{
                  method:'put',
                  headers:{'Content-type':'application/json'},
                  body:JSON.stringify({
                      id: this.state.user.id
                  })
              })
              .then(response=>response.json())
              .then(count=>{
                  this.setState(Object.assign(this.state.user,{entries:count})
                  )
              })
              .catch(console.log)
          }
           this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
        }
  onRouteChange=(route)=>{
        if(route==='signout'){
            this.setState({imageUrl:''})
        }
        else if(route==='home'){
            this.setState({isSignedIn:true})
        }
        this.setState({route:route});
    }
  render(){
      // we have destructured so we dont have to use this.state infront of all the state variables
     const {isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
          <Particles className="Particles"
                 params={particlesOptions} />
          <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
         {
              route ==='home'
              ? <div>
                  <Logo />
                  <Rank
                  name={this.state.user.name}
                  entries={this.state.user.entries}
                  />
                  <ImageLinkForm
                  onInputChange={this.onInputChange}
                  onButtonSubmit={this.onButtonSubmit}
                  />
                  <FaceRecognition box={box} imageUrl={imageUrl}/>
              </div>
             : (
                 this.state.route==='signin'
                 ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                 : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>

             )

         }

      </div>
    );
  }

}

export default App;
