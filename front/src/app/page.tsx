import GoogleMapComponent from '../components/GoogleMapComponent';
import GetListOfMembersComponent from '../components/GetListOfMembersComponent';
import CreateMember from '../components/CreateMember';

export default function Home() {
  
  return (
    <div>
      <h1>Calling the contract</h1>
      <br />
      <GetListOfMembersComponent />
      <br />
      <CreateMember />
      <br />
      <b><h1>Ubicación del lote</h1></b>
      <GoogleMapComponent />
    </div>
  );

}
