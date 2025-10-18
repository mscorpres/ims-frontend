export const  transformData = (data:any) => {

 const tfData =   data.map((d:any) => {
        return {
            value : d.id ?? d.value,
            label : d.text
        }
    })
  
    return tfData
}