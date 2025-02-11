import { useState } from "react";
import { Loader } from "../../Loader";
const Dashboard = () => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <>
    {loading && <Loader />}
    <h1>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium sed
      est porro? Neque quo repudiandae architecto molestiae deleniti asperiores
      ea et molestias numquam provident! Perferendis, eaque cupiditate? Et
      repellendus ut laudantium! Magnam aliquam voluptas id voluptatum
      consequatur molestiae illum ratione nostrum quo odit soluta quas, eius,
      molestias animi! Soluta itaque placeat ut nostrum, distinctio id corporis
      porro commodi nobis omnis error. Accusantium possimus porro autem laborum
      sequi voluptas culpa quae vel aperiam? Molestiae possimus hic aspernatur
      ea voluptates vel, dolore tenetur et enim accusamus? Maxime cumque
      cupiditate ex, sequi magni necessitatibus eum officia tempora quae modi,
      quasi doloremque suscipit illum! Reiciendis nemo rem, adipisci, eos
      debitis at aspernatur inventore fugiat quidem provident ex? Laboriosam
      odit quidem exercitationem deleniti in at?
    </h1>
    </>
  );
};

export default Dashboard;
