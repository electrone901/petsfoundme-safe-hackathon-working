import Image from 'next/image'
import { useEffect, useState, useContext } from 'react'
import { Inter } from 'next/font/google'
import styles from '@/styles/HomeGallery.module.css'
import ABI_GELATO from '../abis/ABI_CONTRACT.json'
import ProfileList from '../components/home-container/gallery/profile-list/ProfileList'
import { Grid, Container, Card, Button } from '@mui/material'
const inter = Inter({ subsets: ['latin'] })
import { SafeAuthKit, SafeAuthProviderType } from '@safe-global/auth-kit'
import { SafeOnRampKit, SafeOnRampProviderType } from '@safe-global/onramp-kit'
import { ethers } from 'ethers'
import { MyAppContext } from '../pages/_app'

export default function Home() {
  const {
    account,
    setAccount,
    contract,
    setContract,
    selectedProfile,
    setSelectedProfile,
    data,
    setData,
  } = useContext(MyAppContext)

  console.log('🚀 ~ file: index.js:25 ~ Home ~ data:', data)
  const GELATO_CONTRACT = '0x1aae17D2C4B5ea1b6cf4eeFC0D2f54bc5cD464cf'
  const [contractGelato, setContractGelato] = useState(null)

  const donateNow = async (event) => {
    event.preventDefault()
    const selectedProfile = {}
    const donationAmmount = 3
    selectedProfile.fundraiserId = 0

    const res = await contractGelato.donate(
      selectedProfile.fundraiserId,
      donationAmmount,
    )

    const tx = await res.wait()

    console.log('🚀 ~ file: DonateNFT.js ~ line 49 ~ donateNow ~ tx', tx)

    // setDonationConfirmation(tx)
    // setDonationAmmount('')
  }

  const getSafeAuthKitProvider = async (safeAuthKit) => {
    // Using ethers
    const provider = new ethers.providers.Web3Provider(
      safeAuthKit.getProvider(),
    )
    let signer = provider.getSigner()

    let contract = new ethers.Contract(GELATO_CONTRACT, ABI_GELATO, signer)
    setContractGelato(contract)
    getFundraisers(contract)

    // const message = 'hello world'
    // await signer.sendTransaction(tx)
    // console.log('sendTransaction:', signer)
    // await signer.signTransaction(tx)
    // console.log('signTransaction:', signer)
    // await signer.signMessage(message)
    // console.log('signMessage:', signer)
  }

  const loginSafeAuthKit = async () => {
    const safeAuthKit = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, {
      chainId: '0x13881',
      authProviderConfig: {
        rpcTarget: 'https://rpc-mumbai.maticvigil.com/', // Add your RPC e.g. https://goerli.infura.io/v3/<your project id>
        clientId:
          'BInHmi5mb7OS5-JcYHCZ33D4VDEgvIjPMzCJ1LcOs5HOFya0wh4KSSjWQutFTY2ouWIasQb0cdysslZ8x8OKkqk', // Add your client id. Get it from the Web3Auth dashboard
        network: 'testnet', // The network to use for the Web3Auth modal. Use 'testnet' while developing and 'mainnet' for production use
        theme: 'light' | 'dark', // The theme to use for the Web3Auth modal
        modalConfig: {
          // The modal config is optional and it's used to customize the Web3Auth modal
          // Check the Web3Auth documentation for more info: https://web3auth.io/docs/sdk/web/modal/whitelabel#initmodal
        },
      },
    })
    console.log(
      '🚀 ~ file: index.js:26 ~ loginSafeAuthKit ~ safeAuthKit:',
      safeAuthKit,
    )

    const a = await safeAuthKit.signIn()
    console.log('🚀 ~ file: index.js:29 ~ loginSafeAuthKit ~ a:', a)

    getSafeAuthKitProvider(safeAuthKit)
  }

  const getImage = (ipfsURL) => {
    if (!ipfsURL) return
    ipfsURL = ipfsURL.split('://')
    return 'https://ipfs.io/ipfs/' + ipfsURL[1]
  }

  const getFundraisers = async (contract) => {
    console.log('what is the contract contract:', contract)
    const temp = []
    const res = await contract.getAllFundraisers()
    for (let i = 0; i < res.length; i++) {
      let obj = {}
      // data from smart contract
      const organizer = res[i][4]
      const totalDonations = res[i]['totalDonations'].toString()
      const fundraiserId = res[i].id.toString()

      // fetchs data from nftStorage
      const nftStorageURL = res[i][1]
      let getNFTStorageData = await fetch(nftStorageURL)
      let fundraiserData = await getNFTStorageData.json()

      //  fundraiser data
      const img = getImage(fundraiserData.image)
      // gets data from nftStorage
      const data = JSON.parse(fundraiserData.description)
      // builds fundraiser data
      obj.fundraiserId = fundraiserId
      obj.organizer = organizer
      obj.totalDonations = totalDonations
      obj.title = fundraiserData.name
      obj.image = img
      obj.description = data.description
      obj.category = data.category
      obj.targetAmmount = data.targetAmmount
      obj.creationDate = data.creationDate
      temp.push(obj)
    }
    setData(temp)
  }

  useEffect(() => {
    if (contract) {
      getFundraisers(contract)
    }
  }, [contract])
  return (
    <div
      style={{
        minHeight: '70vh',
        paddingBottom: '4rem',
        paddingTop: '.5rem',
      }}
    >
      <Container>
        <Container>
          <div className={styles.root}>
            <Grid
              container
              spacing={3}
              style={{
                paddingTop: '1rem',
                paddingBottom: '1rem',
              }}
            >
              <Grid item xs={5} className={styles.outer}>
                <img
                  src="/logo.png"
                  className={styles.logoHero}
                  alt="logo-hero"
                />
              </Grid>
              <Grid item xs={7}>
                <p className={styles.homeTextIntro}>
                  <strong>PetsFoundMe</strong> is a social app built by the
                  community for everyone who loves and supports pets.
                  PetsFoundMe is an NFT platform where pet owners and pet lovers
                  come together and help each other to solve their pet's needs
                  from expensive surgeries to food supplies or free services.
                </p>{' '}
                <br />
                <p className={styles.home2TextIntro}>
                  PetsFoundMe is the perfect pet hub for nonprofits, medical &
                  government institutions, influencers, and artists to come
                  together to solve the needs of the Community Pets. Come to ask
                  for financial support, as questions, answer questions, and
                  give or receive donations. Come join us to make this planet a
                  better world.
                </p>
              </Grid>
            </Grid>
          </div>
        </Container>

        {/* search */}
        <form className={styles.searchForm}>
          <div className={styles.pseudoSearch}>
            <input
              type="text"
              placeholder="Search for people, etc"
              autoFocus
              required
            />
            <span className={styles.searchClear}>Clear</span>
            <span className={styles.searchIcon}>🔍</span>
          </div>
        </form>

        <br />
        <Card
          style={{
            borderRadius: '24px',
            paddingTop: '1rem',
            paddingBottom: '1rem',
            backgroundColor: '#fff9f7',
            minHeight: '20rem',
          }}
        >
          {data.length ? (
            <ProfileList setSelectedProfile={setSelectedProfile} data={data} />
          ) : (
            <div style={{ textAlign: 'center', paddingTop: '5rem' }}>
              <Button
                style={{
                  backgroundColor: '#FF835B',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '10px',
                }}
              >
                Please connect your wallet to Mumbai Network
              </Button>
            </div>
          )}
        </Card>
      </Container>
    </div>
  )
}
