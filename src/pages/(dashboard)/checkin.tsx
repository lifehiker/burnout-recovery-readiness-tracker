import type { GetServerSideProps } from "next"

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/checkin",
      permanent: false,
    },
  }
}

export default function CheckinRedirect() {
  return null
}
