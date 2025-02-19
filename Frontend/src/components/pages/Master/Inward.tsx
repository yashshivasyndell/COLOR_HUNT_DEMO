import { useNavigate } from "react-router-dom"
import { Button } from "../../ui/button"


const Inward = () => {
  const navigate = useNavigate()
  return (
    <div><Button onClick={()=>navigate('/add-inward')}>Add-inward</Button></div>
  )
}

export default Inward