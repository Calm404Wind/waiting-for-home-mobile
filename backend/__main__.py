import argparse

import uvicorn


def main():
    parser = argparse.ArgumentParser(description='啟動《等一個家》手機 Demo。')
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8047)
    args = parser.parse_args()
    uvicorn.run('backend.server:app', host=args.host, port=args.port, access_log=False)


if __name__ == '__main__':
    main()
